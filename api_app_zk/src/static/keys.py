#! /usr/bin/env python3

import sys
import json
import base64
import time
import re

#sys.path.insert(1, '/opt/gopath/src/github.com/hyperledger/fabric/API/scripts/pycrypto/')
from bitstring import BitArray
from hashlib import sha256

sys.path.insert(1,'./pycrypto/')

from zokrates_pycrypto.eddsa import PublicKey
from zokrates_pycrypto.eddsa import PrivateKey
from zokrates_pycrypto.babyjubjub import Point
from zokrates_pycrypto.field import FQ
from zokrates_pycrypto.gadgets.pedersenHasher import PedersenHasher
from zokrates_pycrypto.babyjubjub import JUBJUB_E
from zokrates_pycrypto.utils import pprint_hex_as_256bit
from math import log,modf,ceil,log2



#TREELEN = 4194304 # amount of leafs of the Merkle Tree
FILE = "privkeys.txt"
FILEMT = "mtree.txt"
PKEY = "./code_zok/proving.key"
VKEY = "./code_zok/verification.key"


################## PEDERSEN ########################################
# Pedersen hash function


def HashPedersen(nodeLeft, nodeRight):

    inputs_byte = nodeLeft.compress()+nodeRight.compress()
    hasher_mt = PedersenHasher(b"test")
    tohash = BitArray(inputs_byte)

    digest = hasher_mt.hash_bits(tohash)

    #print(hasher_mt.dsl_code)
    return digest


################## EDDSA ########################################


# gen a eddsa private key
def GenFeFromRut(rut):
    # get the max length of the curve
    mod = JUBJUB_E
    nbytes = ceil(ceil(log2(mod)) / 8)

    rut = re.sub(r'\W+', '', rut) # get inly alpha numeric character
    copyrut = rut[len(rut)-5:] # copy the last 4 digits of rut
    hs = sha256()
    hs.update( (rut+copyrut).encode('utf-8'))
    return str(int.from_bytes(hs.digest(), "little")) #use sha256 as the scalar for privkey



def GenFe():
    pvk = PrivateKey("").from_rand()
    return str(pvk.fe) #return the scalar value

#get pub and priv key object  from priv key scalar
def PairFromFe(fe):
    k = FQ(int(fe))
    pvk = PrivateKey(k)
    puk = PublicKey("").from_private(pvk)
    return (pvk,puk)

# gen pubkey object from its points
def GenPubKey(x,y):
    p = Point(int(x),int(y))
    return PublicKey(p)

# make the sign object and msg with the zokrates format
def SignObj(pk, root):
    R,S = pk.sign(root)
    M0 = root.hex()[:64]
    M1 = root.hex()[64:]
    b0 = BitArray(int(M0, 16).to_bytes(32, "big")).bin
    b1 = BitArray(int(M1, 16).to_bytes(32, "big")).bin

    return R,S, " ".join(b0+b1)


########################## MERKLE TREE ####################################3
# gen a merkle tree from a list of private keys
def genMerkleTree(voters_pk):
    #print("gen merkle tree")
    if len(voters_pk) != TREELEN :
        print("Is not the size of a merkle tree")
    leafs = [] # a list of pubkey pedersen hashes
    mt = [] # a list of nodes (list of lists)

    #make the leafs
    for pk in voters_pk:
        pvk,pub = PairFromFe(pk)
        pub_hash = HashPedersen(pub.p,pub.p)
        leafs.append(pub_hash)

    # make the inner nodes
    for k in range(int(log(TREELEN,2))):
        if k == 0:
            mt.append(leafs)
        else :
            mtp = makeParent(mt[k-1])
            mt.append(mtp)

    #make the root
    mt.append(makeParent(mt[len(mt)-1]))
    root = mt[len(mt)-1]
    voters = []
    for addr in leafs:
        voters.append([addr.compress().hex(),root[0].compress().hex()])

    return mt,voters
# gen multiple MTs, do nothing at the momment
def genMultipleMT(total_voters):
    balancedMTs = int(total_voters/TREELEN)
    unbalanced = total_voters%TREELEN
    print("mts "+ str(balancedMTs)+" nobalanced" +str(unbalanced))


# gen a parent row from a child row
def makeParent(childs):
    i=0
    parents = []
    for k in childs:
        if i % 2 != 0:
            parent = HashPedersen(childs[i-1],k)
            parents.append(parent)
        i+=1
    return parents

# get the node child partner of another node
def getPartner(node, node_list):
    for k in range(len(node_list)):
        bytenode = bytes.fromhex(node_list[k])
        decomp = Point("","").decompress(bytenode)
        if node==decomp:
            if k%2 != 0:
                mtx = 1
                bytenode = bytes.fromhex(node_list[k-1])
                partner = Point("","").decompress(bytenode)
                parent = HashPedersen(partner,node)
            else:
                mtx = 0
                bytenode = bytes.fromhex(node_list[k+1])
                partner = Point("","").decompress(bytenode)
                parent = HashPedersen(node,partner)
    return mtx,partner,parent

#gen the path of a merkle tree from a leaf
def getPath(mt,pubkey):
    path=[]
    mtxs = []
    pub_hash = HashPedersen(pubkey.p,pubkey.p)
    mtx,partner,parent = getPartner(pub_hash,mt['leafs'])
    path.append(str(partner.x.n))
    path.append(str(partner.y.n))
    mtxs.append(str(mtx))
    for k in range(len(mt['inner_nodes'])-1):
        mtx,partner,parent = getPartner(parent,mt['inner_nodes'][k])
        path.append(str(partner.x.n))
        path.append(str(partner.y.n))
        mtxs.append(str(mtx))

    return path,mtxs


#make the json string of the merkle tree
def stringfyMtree(mtree):
    #initime = time.time()
    leafs=[]
    innernodes= []
    parents=[]
    high=len(mtree)
    root=mtree[high-1][0].compress().hex()
    for k in range(high):
        if k==0:
            for nodes in mtree[0]:
                leafs.append(nodes)
        else:
            for nodes in mtree[k]:
                parents.append(nodes.compress().hex())
            innernodes.append(parents)
            parents = []
    size = len(leafs)
    mtob =  {
            'root':root,
            'leafs':leafs,
            'inner_nodes': innernodes,
            'n':size,
            'h':high
        }


    #print("mt string generation %f" % (time.time() - initime))
    return mtob
####################### FORMAT CHORES ###############################

# make the json representation of the verifier key
def formatkey(raw):
    rawbytes = raw.read()
    lines = []
    gammas = []
    for line in str(rawbytes).split("\n"):
        lines.append(line.split("=")[1].replace(" ","").replace("[","").replace("]",""))
    for gamma in lines[5:]:
        gammas.extend(gamma.split(","))

    return {
        'alpha' : lines[0].split(","),
        'beta'  : lines[1].split(","),
        'gamma' : lines[2].split(","),
        'delta' : lines[3].split(","),
        'gamma_abc' : gammas

    }
# make the format of both zk keys
def getProofKeys():
    #print("getting merkle tree")
    with open(VKEY,'r') as vkfileraw:
        vkjson = formatkey(vkfileraw)
    with open(PKEY,'rb') as pkeyjson:
        pk = pkeyjson.read()

    encodepk = base64.b64encode(pk)
    return vkjson,encodepk.decode('utf-8')


############################# TEST SCENARIOS ######################

#make the init inputs
def InitRequest(mtree, voterslist):

    mtreeobj = stringfyMtree(mtree)
    vk,pk = getProofKeys()
    #print(mtreeobj)
    enroll = {
        'voters':voterslist,
        'mt':mtreeobj,
        'verification_key': vk,
        'prover_key': pk
    }
    mtfile = open(FILEMT,"w")
    mtfile.write(json.dumps(enroll))
    mtfile.close()
    return json.dumps(enroll)




# gen a scenario to test a proof
def genMTtest(rutlist):
    vts = []
    erase = open(FILE,"w")
    erase.write("")
    erase.close()
    #print("gen private keys")
    #start_time = time.time()
    f = open(FILE, "a")
    for rut in rutlist:
        key = GenFeFromRut(rut)
        f.write(str(key)+",")
        vts.append(key)
    f.close()
    #print("key generation %f" % (time.time() - start_time))
    start_time = time.time()
    mt,voters = genMerkleTree(vts)
    #print("mt generation %f" % (time.time() - start_time))


    return mt,voters,vts
# gen inputs of chaincode
def Init(rutlist):
    base2 = modf(log2(len(rutlist)))
    if base2[0] != 0:
        print("len of list is not base 2" )
        print(base2)
        return

    mt,voters,vts = genMTtest(rutlist)
    #stringfyMtree(mt)
    print(InitRequest(mt,voters).replace('\\"','\"'))
# gen inputs of proof
def test(rutlist):
    if modf(log2(len(rutlist)))[0] != 0:
        print("len of list is not base 2")
        return
    mt,voters,vts = genMTtest(rutlist)
    pv,pubkey = PairFromFe(vts[0])
    path,mtxs = getPath(mt, pubkey)

    root = mt[len(mt)-1][0]
    R,S, msg = SignObj(pv,2*root.compress())
    null = HashPedersen(R,R)

    pathstr = ",\n".join(path)
    mtxstr = " ".join(mtxs)

    #print(str(R.x.n)+" "+str(R.y.n)+" "+str(S)+" "+str(pubkey.p.x.n)+" "+str(pubkey.p.y.n)+" "+msg+" "+pathstr+" "+mtxstr+" "+str(root.x.n)+" "+str(root.y.n) +" "+str(null.x.n)+" "+str(null.y.n))
#test eddsa sign
def testsign(rut,msg):
    fe = GenFeFromRut(rut)
    pv,pub = PairFromFe(fe)
    msgobj = HashPedersen(pub.p,pub.p)
    R,S,msgr = SignObj(pv,msgobj.compress()*2)
    if pub.verify((R,S),msgobj.compress()*2):
        print("wena shoro")
    else:
        print("rip")

def witness(rut,mt):

    mtobj = json.loads(mt)
    if modf(log2(len(mtobj['leafs'])))[0] != 0:
        print("len of list is not base 2")
        return
    fe = GenFeFromRut(rut)
    pv,pubkey = PairFromFe(fe)
    path,mtxs = getPath(mtobj, pubkey)
    byteroot = bytes.fromhex(mtobj['root'])
    root = Point("","").decompress(byteroot)
    R,S, msg = SignObj(pv,2*root.compress())
    null = HashPedersen(R,R)

    pathstr = " ".join(path)
    mtxstr = " ".join(mtxs)
    print(str(R.x.n)+" "+str(R.y.n)+" "+str(S)+" "+str(pubkey.p.x.n)+" "+str(pubkey.p.y.n)+" "+msg+" "+pathstr+" "+mtxstr+" "+str(root.x.n)+" "+str(root.y.n) +" "+str(null.x.n)+" "+str(null.y.n))
    sys.stdout.flush()


###################### MAIN ##################333
if __name__== "__main__":
    fn = sys.argv[1]

    if fn == "test":
        TREELEN = len(sys.argv[2:])
        test(sys.argv[2:])
    elif fn ==  "init":
        TREELEN = len(sys.argv[2:])
        Init(sys.argv[2:])
    elif fn == "witness":
        witness(sys.argv[2], sys.argv[3])
    elif fn == "sign":
        testsign(sys.argv[2],sys.argv[3])

    else :
        print("op desconocido")
#genMTtest()
