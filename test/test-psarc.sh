#!/bin/bash

inputPSARC=$1
echo "Operating on" $inputPSARC
cp $inputPSARC /tmp/test_m.psarc
cd /tmp
pyrocksmith --unpack test_m.psarc
rm test_m.psarc
cd -

echo "Writing wems..."
files=`ls /tmp/test_m/audio/mac/*.wem`
for item in $files
do
    echo $item
    node src/wemwriter.js /tmp/output.wem $item
    cp /tmp/output.wem $item
done
cd /tmp
pyrocksmith --pack test_m
rm -rf /tmp/test_m
mv /tmp/test_m.psarc "/Users/sandi/Library/Application Support/Steam/steamapps/common/Rocksmith2014/dlc/rocksmith_cdlc/"
echo "copied generated test_m.psarc!"