#!/usr/bin/env bash
set -e # 에러 발생 시 스크립트 중단

git config --global user.name "RoCode Dev";
git config --global user.email "RoCodedev@nts-corp.com";

branchName=${GITHUB_REF##*/}
deployName="dist/$branchName"

export NODE_ENV=production

#if [ "$branchName" = "master" ]
#then
    #git clone -b build "https://github.com/$GITHUB_REPOSITORY" build
#else
    #git clone "https://github.com/$GITHUB_REPOSITORY" build
    #if git show-ref --quiet refs/remotes/origin/"$deployName"; then
    #    git clone -b "$deployName" "https://github.com/$GITHUB_REPOSITORY" build
    #else
    #    git clone "https://github.com/$GITHUB_REPOSITORY" build
    #    git checkout -b "$deployName"
    #fi
#fi

git clone -b build "https://github.com/$GITHUB_REPOSITORY" build
rm -rf build/**/* || exit 0
cp -r dist build/
cp -r extern build/
cp -r images build/
cp -r weights build/
rsync -R src/playground/block_RoCode.js build
rsync -R src/playground/block_RoCode_mini.js build
rsync -r -R src/playground/blocks/ build
ls -al
ls -al build
