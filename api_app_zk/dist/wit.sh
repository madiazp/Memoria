#! /bin/bash
#Variables
PROOF="proof.json"

NEWDIR="proof1"$(( + $RANDOM % 507961 ))$(date +%s)

#Set envirnonment
mkdir $NEWDIR
cd $NEWDIR
cp ../out ../proving.key .
zokrates compute-witness -a $@  &>/dev/null
zokrates generate-proof  &>/dev/null

#hash1=$(echo $hash1 | sed 's/ //g')
#hash1=$(head -n 1 witness | awk '{print $2}' )
#Prosesando las pruebas
#proof=$(cat $PROOF | tr --delete " }[\"]inputs,{" | sed 's/a://g' | sed 's/b://g' | sed 's/c://g' | sed 's/0x//g' | sed 's/roof//g'|tr -d ":\n")
#proof=$(echo $proof | sed 's/ //g')
# $PROOF
cat proof.json
cd ../
rm -rf $NEWDIR
#echo $proof
