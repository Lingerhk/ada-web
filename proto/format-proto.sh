#!/bin/bash

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    # MacOS
    sed -i '' 's@string language = 1@string language = 1 @' proto/ada.proto
    sed -i '' 's@^import@// import@; s@ \[(valid@; // \[(valid@' proto/ada.proto
else
    sed -i 's@string language = 1@string language = 1 @' proto/ada.proto
    sed -i 's@^import@// import@; s@ \[(valid@; // \[(valid@' proto/ada.proto
fi