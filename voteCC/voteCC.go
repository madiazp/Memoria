package main

import (
    "reflect"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/big"
	"strings"
	"time"

	"github.com/clearmatics/bn256"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const (
	ALT1 = "Candidato1"
	ALT2 = "Candidato2"
)

type SmartContract struct {
	contractapi.Contract
}

type Vote struct {
	Proof     []byte `json:"proof"`
	Validator []string `json:"validator"`
	Value     string `json:"value"`
}

type VoterProof struct {
	Proof []byte `json:"proof"`
}

type Voter struct {
	Name string `json:"name"`
	Addr string `json:"addr"`
}

type Padron struct {
	Voters      [][]string      `json:"voters"`
    VoterConst  ConstStruct     `json:"vote_const"`
	Vk          string          `json:"verification_key"`
}

type ConstStruct struct {
    Value   string      `json:"value"`
    Hash    []string    `json:"hash"`
}

type VerKey struct {
	Alpha bn256.G1   `json:"alpha"`
	Beta  bn256.G2   `json:"beta"`
	Gamma bn256.G2   `json:"gamma"`
	Delta bn256.G2   `json:"delta"`
	Gabc  []bn256.G1 `json:"gamma_abc"`
}

type Proof struct {
	A bn256.G1 `json:"a"`
	B bn256.G2 `json:"b"`
	C bn256.G1 `json:"c"`
}

type VerKeyJson struct {
	Alpha []string `json:"alpha"`
	Beta  [][]string `json:"beta"`
	Gamma [][]string `json:"gamma"`
	Delta [][]string `json:"delta"`
	Gabc  [][]string `json:"gamma_abc"`
}

type InnerProof struct {
	A []string   `json:"a"`
	B [][]string `json:"b"`
	C []string   `json:"c"`
}

type ZokProof struct {
	Proof  InnerProof `json:"proof"`
	Inputs []string   `json:"inputs"`
}

type VoteVerifPublic struct {
    VoteRoll    [][]string
    VoteCast    []string
    VotingConst []string
    Nullifier   []string
    SignCast    []string
}

func (s *SmartContract) CcSetup(ctx contractapi.TransactionContextInterface, padron string  ) error {
    fmt.Printf("padron: %v \n", padron)
    pp := Padron{}
    errj := json.Unmarshal([]byte(padron), &pp)
    if errj != nil {
        return fmt.Errorf("Error en umarshal del padron: "+ errj.Error())
    }
    err3 := ctx.GetStub().PutState("padron", []byte(padron))
	if err3 != nil {
		return fmt.Errorf("Error agregando el padron:" + err3.Error())
	}

	return nil
}


func (s *SmartContract) CcAddId(ctx contractapi.TransactionContextInterface, id []string  ) error {
	pp, err := ctx.GetStub().GetState("padron")
	if err != nil {
		return fmt.Errorf("error buscando el padron " + err.Error())
	}
    padron := Padron{}
    errj := json.Unmarshal(pp, &padron)
    if errj != nil {
        return fmt.Errorf("Error en umarshal del padron: "+ errj.Error())
    }
    padron.Voters = append(padron.Voters, id)
    padronJ, err3 := json.Marshal(padron)
    if err3 != nil {
        return fmt.Errorf("Error serializando el padron" + err3.Error())
    }
	err4 := ctx.GetStub().PutState("padron", []byte(padronJ))
	if err4 != nil {
		return fmt.Errorf("Error agregando el padron:" + err3.Error())
	}
	return nil
}

func (s *SmartContract) CcGetArtifacts(ctx contractapi.TransactionContextInterface) (string, error) {
	pp, err := ctx.GetStub().GetState("padron")
	if err != nil {
		return "", fmt.Errorf("error buscando el padron " + err.Error())
	}
    padron := Padron{}
    errj := json.Unmarshal(pp, &padron)
    if errj != nil {
        return "", fmt.Errorf("Error en umarshal del padron: "+ errj.Error())
    }
    type Ans struct {
        VoteConst ConstStruct `json:"voteConst"`
        VoteRoll [][]string `json:"voteRoll"`
    }
    ans := Ans{
        VoteConst: padron.VoterConst,
        VoteRoll: padron.Voters,
    }
    res, errm := json.Marshal(ans)
    if errm != nil {
        return "", fmt.Errorf("Error serialziando a los votantes")
    }
	return string(res), nil
}

func (s *SmartContract) CcGet(ctx contractapi.TransactionContextInterface, arg string) (string, error) {

	if len(arg) != 1 {
		return "", fmt.Errorf("Arguemntos incorrectos")
	}
	val, err := ctx.GetStub().GetState(arg)
	if err != nil {
        return "", fmt.Errorf("No se pudo obtener el voto del votante rol %s", arg)
	}
	fmt.Printf("valor: %s \n", string(val))
	return string(val), nil

}

func (s *SmartContract) CcGetValue(ctx contractapi.TransactionContextInterface, index string) (string, error) {
	query := `{
   "selector": {
      "proof": {
         "nullifier": "` + index + `"
		   }
		}
	}`

	queryres, errq := ctx.GetStub().GetQueryResult(query)
	if errq != nil {
		return "", fmt.Errorf("Error haciendo la query: " + errq.Error())
	}
	defer queryres.Close()
	var response [][]byte
	for queryres.HasNext() {
		res, errr := queryres.Next()
		if errr != nil {
			log.Println(errr.Error())
		}
		response = append(response, res.GetValue())

	}

	return string(response[0]), nil

}

type SelValue struct {
	Value string `json:"value"`
}
type SelQuery struct {
	Selector SelValue `json:"selector"`
}

func (s *SmartContract) CcGetResult(ctx contractapi.TransactionContextInterface) (string, error) {
	queryCandidato1 := SelQuery{
		Selector: SelValue{
			Value: "Candidato1",
		},
	}

	queryCandidato2 := SelQuery{
		Selector: SelValue{
			Value: "Candidato2",
		},
	}

	Candidato1byte, errqj := json.Marshal(queryCandidato1)
	if errqj != nil {
		return "", fmt.Errorf("error haciendo la query a Candidato1 " + errqj.Error())
	}
	Candidato2byte, errqo := json.Marshal(queryCandidato2)
	if errqo != nil {
		return "", fmt.Errorf("error haciendo la query a Candidato2 " + errqo.Error())
	}
	log.Printf("Candidato1: %v \n Candidato2 : %v \n", string(Candidato1byte), string(Candidato2byte))

	Candidato1count, jcerr := countQuery(Candidato1byte, ctx)
	if jcerr != nil {
		return "", fmt.Errorf(jcerr.Error())
	}

    Candidato2count, Candidato2err := countQuery(Candidato2byte, ctx)
	if Candidato2err != nil {
		return "", fmt.Errorf(Candidato2err.Error())
	}

	resp := struct {
		C1 uint `json:"Candidato1"`
		C2  uint `json:"Candidato2"`
	}{
		C1: Candidato1count,
		C2:  Candidato2count,
	}
	respj, erresp := json.Marshal(resp)
	if erresp != nil {
		return "", fmt.Errorf(erresp.Error())
	}
	return  string(respj), nil

}

func (s *SmartContract) CcVote(ctx contractapi.TransactionContextInterface,  proofObj ZokProof, value string) (string, error) {
    fmt.Printf("proof: %v", proofObj)
	padronbytes, errpadron := ctx.GetStub().GetState("padron")
	if errpadron != nil {
		return "", fmt.Errorf("Error al obtener la vk " + errpadron.Error())
	}
    pp := Padron{}
    errjpp := json.Unmarshal(padronbytes, &pp)
	if errjpp != nil {
		return "", fmt.Errorf("Error unmarshal del padron " + errjpp.Error())
	}
    fmt.Printf("PROOF: %v \n\n", proofObj)
    fmt.Printf("PAdron: %v \n\n", pp)
    fmt.Printf("VK: %v", pp.Vk)
	Vk, errvkj := vkFromJson([]byte(pp.Vk))
	if errvkj != nil {
		return "", fmt.Errorf("Error al obtener la vk " + errvkj.Error())
	}

	proof, inputs, inputsVer := ProofFromJson(proofObj)
    if !reflect.DeepEqual(inputsVer.VoteRoll, pp.Voters) {
        return "", fmt.Errorf("Error al verificar el padron electoral")
    }

	if ok, _ := ctx.GetStub().GetState(fmt.Sprintf("%v",inputsVer.Nullifier)); ok != nil {
		return "", fmt.Errorf("Prueba ya utilizada")
	}
	startvf := time.Now()
	if !verify(Vk, proof, inputs) {
		return "", fmt.Errorf("Prueba no comprobada")
	}
	log.Printf("verificacion: %s \n", time.Since(startvf))
    proofJson, errpj := json.Marshal(proofObj)
    if errpj != nil {
        return "", fmt.Errorf("error formateando prueba para guardar: "+ errpj.Error())
    }
	vote := Vote{
		Proof:     proofJson,
		Validator: inputsVer.SignCast,
		Value:     value,
	}
	voteBytes, errm := json.Marshal(vote)
	if errm != nil {
		return "",fmt.Errorf("Error serialziando el voto: " + errm.Error())
	}
	if out := ctx.GetStub().PutState(fmt.Sprintf("%v", inputsVer.Nullifier), voteBytes); out != nil {
		return "", fmt.Errorf("Error guardando el voto: " + out.Error())
	}
	return  string(voteBytes), nil
}

func (s *SmartContract) CcAll(ctx contractapi.TransactionContextInterface) (string, error) {
	state, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return "", fmt.Errorf("Error obteniendo los resultados: " + err.Error())
	}
	var aux []string
	for state.HasNext() {
		val, erri := state.Next()
		if erri != nil {
			log.Println("Error: " + erri.Error())
			break
		}
		aux = append(aux, val.String())
	}
	return strings.Join(aux, "\n"), nil
}

func countQuery(query []byte, ctx contractapi.TransactionContextInterface) (uint, error) {
	queryres, errq := ctx.GetStub().GetQueryResult(string(query))
	if errq != nil {
		return 0, errq
	}

	defer queryres.Close()
	var qcount uint
	for queryres.HasNext() {
		val, _ := queryres.Next()
		log.Printf("value: %s\n", string(val.Value))
		qcount++
	}
	log.Printf("count: %d", qcount)
	return qcount, nil
}

func verify(vk VerKey, proof Proof, inputs []*big.Int) bool {
	vkx, errvk := makeVkX(inputs, vk)
	if errvk != nil {
		log.Printf("Error getting Vk_x: %v", errvk)
		return false
	}
	var g1P []*bn256.G1
	var g2P []*bn256.G2
	g1P = append(g1P, &proof.A, new(bn256.G1).Neg(vkx), new(bn256.G1).Neg(&proof.C), new(bn256.G1).Neg(&vk.Alpha))
	g2P = append(g2P, &proof.B, &vk.Gamma, &vk.Delta, &vk.Beta)

	return bn256.PairingCheck(g1P, g2P)
}

func makeVkX(inputs []*big.Int, vk VerKey) (*bn256.G1, error) {
	vkx := parseG1Point([]string{"00", "00"})
    fmt.Printf("LEN OF INPUTS: %v\n LEN OF GAMMA ABC: %v \n",len(inputs), len(vk.Gabc))
	if len(inputs)+1 != len(vk.Gabc) {
		return vkx, errors.New("inputs lenght error")
	}

	for i, _ := range inputs {
		adder := new(bn256.G1).ScalarMult(&vk.Gabc[i+1], inputs[i])
		vkx = new(bn256.G1).Add(vkx, adder)
	}
	vkx = new(bn256.G1).Add(vkx, &vk.Gabc[0])
	return vkx, nil
}

func vkFromJson(vkjson []byte) (VerKey, error) {
	Vk := new(VerKey)
	jvk := &VerKeyJson{}
	json.Unmarshal(vkjson, jvk)
    flattBeta := flattG2(jvk.Beta)
    flattDelta := flattG2(jvk.Delta)
    flattGamma := flattG2(jvk.Gamma)
    fmt.Printf(" Beta FLAT: %v", flattBeta)
	Vk.Alpha.Set(parseG1Point(jvk.Alpha))
	Vk.Beta.Set(parseG2Point(flattBeta))
	Vk.Delta.Set(parseG2Point(flattDelta))
	Vk.Gamma.Set(parseG2Point(flattGamma))

	var gabcG *bn256.G1
    fmt.Printf(" jvk GABC %v \n", jvk.Gabc)
	for _, inp := range jvk.Gabc {
		gabcG = parseG1Point(inp)
		Vk.Gabc = append(Vk.Gabc, *gabcG)
	}

	return *Vk, nil
}

func flattG2( input [][]string) []string {
    return append(input[0], input[1]...)
}

func ProofFromJson(zokProof ZokProof) ( Proof, []*big.Int, VoteVerifPublic) {
	proof := Proof{}
	proof.A.Set(parseG1Point(zokProof.Proof.A))
	proof.B.Set(parseG2Point([]string{zokProof.Proof.B[0][0], zokProof.Proof.B[0][1], zokProof.Proof.B[1][0], zokProof.Proof.B[1][1]}))
	proof.C.Set(parseG1Point(zokProof.Proof.C))
	var inputs []*big.Int

    votePublicArtifacts := VoteVerifPublic{}
    voteRoll := zokProof.Inputs[:80]
	votePublicArtifacts.VoteCast = deformat(zokProof.Inputs[80:88])
	votePublicArtifacts.VotingConst = deformat(zokProof.Inputs[88:96])
	votePublicArtifacts.Nullifier = deformat(zokProof.Inputs[96:104])
	votePublicArtifacts.SignCast = deformat(zokProof.Inputs[104:112])

    rollAux := [][]string{}
    for i, _ := range  voteRoll {
        k := i+1
        if k%8 == 0 {
            rollAux = append(rollAux, deformat(voteRoll[k-8:k]))
        }
    }
    votePublicArtifacts.VoteRoll = rollAux
	for _, inp := range zokProof.Inputs {

		inputs = append(inputs, parseBigInt(inp))
	}
	return proof, inputs, votePublicArtifacts
}

func parseBigInt(s string) *big.Int {
	err := fmt.Errorf("failed to parse %s", s)
	var base int
	if strings.HasPrefix(s, "0x") || strings.HasPrefix(s, "0X") {
		s = s[2:]
		base = 16
	} else if strings.HasPrefix(s, "0") {
		s = s[1:]
		base = 8
	} else if strings.HasPrefix(s, "b") || strings.HasPrefix(s, "B") {
		s = s[1:]
		base = 2
	} else {
		base = 10
	}
	if ret, ok := new(big.Int).SetString(s, base); !ok {
        fmt.Printf("S: %v", s)
		panic(err)
	} else {
		return ret
	}
}

func parseG1Point(s []string) *bn256.G1 {
	x := parseBigInt(s[0])
	y := parseBigInt(s[1])
	p := new(bn256.G1)
	b := make([]byte, 32*2)
	xb := x.Bytes()
	yb := y.Bytes()
	copy(b[1*32-len(xb):1*32], xb)
	copy(b[2*32-len(yb):2*32], yb)
	_, err := p.Unmarshal(b)
	if err != nil {
		log.Printf("error en el punto g1: %v", err)
	}
	return p
}

func parseG2Point(s []string) *bn256.G2 {
    fmt.Printf("S:  %v \n", s)
	xIm := parseBigInt(s[1])
	xRe := parseBigInt(s[0])
	yIm := parseBigInt(s[3])
	yRe := parseBigInt(s[2])
	p := new(bn256.G2)
	b := make([]byte, 32*4)

	xbIm := xIm.Bytes()
	xbRe := xRe.Bytes()
	ybIm := yIm.Bytes()
	ybRe := yRe.Bytes()

	copy(b[1*32-len(xbIm):1*32], xbIm)
	copy(b[2*32-len(xbRe):2*32], xbRe)
	copy(b[3*32-len(ybIm):3*32], ybIm)
	copy(b[4*32-len(ybRe):4*32], ybRe)
	_, err := p.Unmarshal(b)
	if err != nil {
		log.Printf("error en el punto g2 :%v \n", err)
	}
	return p
}

func deformat(input []string) []string {
	newSlice := []string{}
    for _, str := range input {
		newSlice = append(newSlice, fmt.Sprintf("0x%v",str[58:]))
	}
	return newSlice
}

func main() {
	fmt.Println("############## Comenzando mi chaincode 2222222 ###############")
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
    if err := chaincode.Start(); err != nil {
        fmt.Printf("error al iniciar chaincode: %s", err.Error())
    }
	fmt.Printf("Chaincode funcionando 222!!!")
}
