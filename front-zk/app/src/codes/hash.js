const HASH = `
import "hashes/pedersen/512bit.zok" as hash

def main(private u32[8] preImg, u32[10][8] voteRoll, u32[8] voteCast, u32[8] votingConst, u32[8] nullifier, u32[8] signCast):
    u32[8] ans = hash([...preImg, ...preImg])
    bool isIn = 0
    for field i 0..10 do
        isIn = isIn || ans == voteRoll[i]
    endfor
    assert(isIn)

    u32[8] isNull = hash([...preImg, ...ans])
    assert(isNull == nullifier)

    u32[8] isVote = hash([...voteCast, ...votingConst])
    assert(isVote == signCast)
    return
`;
export default HASH;
