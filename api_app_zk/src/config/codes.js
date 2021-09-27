export default {
  HASH: `
import "hashes/pedersen/512bit.zok" as hash
def main(private u32[8] preImg, u32[8] Img):
    u32[8] ans = hash([...preImg,...preImg])
    assert(ans==Img)
    return
    `,
  VOTE: `
import "hashes/pedersen/512bit.zok" as hash                                                         
                                                                                                    
def main(private u32[8] preImg, u32[10][8] voteRoll, u32[8] voteCast, u32[8] votingConst, u32[8] nullifier, u32[8] signCast):
    u32[8] ans = hash([...preImg, ...preImg])                                                       
    field isIn = 1
    field comparator = 0
    for field i in 0..10 do
        comparator = if (ans == voteRoll[i]) then 0 else 1 fi 
        isIn = isIn * comparator                                                           
    endfor                                                                                          
    assert(isIn == 0)                                                                                    
                                                                                                    
    u32[8] isNull = hash([...preImg, ...ans])                                                       
    assert(isNull == nullifier)                                                                     
                                                                                                    
    u32[8] isVote = hash([...voteCast, ...votingConst])                                             
    assert(isVote == signCast)                                                                      
    return 
`,
};
