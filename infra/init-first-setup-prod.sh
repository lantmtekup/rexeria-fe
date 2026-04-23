#!/bin/bash
#!/bin/sh
# Author: bao.hq
# Company: Tekup JSC
# Phone: 0333 365 777
# This file will help build docker image for first time setup project with docker-compose

SCRIPT_PATH="${BASH_SOURCE}"
while [ -L "${SCRIPT_PATH}" ]; do
  SCRIPT_DIR="$(cd -P "$(dirname "${SCRIPT_PATH}")" >/dev/null 2>&1 && pwd)"
  SCRIPT_PATH="$(readlink "${SCRIPT_PATH}")"
  [[ ${SCRIPT_PATH} != /* ]] && SCRIPT_PATH="${SCRIPT_DIR}/${SCRIPT_PATH}"
done
# SCRIPT_PATH="$(readlink -f "${SCRIPT_PATH}")"
SCRIPT_DIR="$(cd -P "$(dirname -- "${SCRIPT_PATH}")" >/dev/null 2>&1 && pwd)"
SCRIPT_ROOT_DIR="${SCRIPT_PATH}/../"
SCRIPT_ROOT_DIR="$(pwd "${SCRIPT_ROOT_DIR}")"
# echo "SCRIPT_PATH $SCRIPT_PATH"
# echo "SCRIPT_DIR $SCRIPT_DIR"
# echo "SCRIPT_ROOT_DIR $SCRIPT_ROOT_DIR"

cd $SCRIPT_DIR

echo "This file will help build docker image for first time setup project with docker-compose"
echo "First time init docker-compose service ..."

sleep 1

if [[ ! -f  ./../.env.prod ]] && [[ -f  ./../.env ]]
then
  cp ./../.env ./../.env.prod
  echo "WARNING: Not found .env.prod file in root folder project at: ${SCRIPT_ROOT_DIR}"
  echo "We use .env content to create .env.prod file at: ${SCRIPT_ROOT_DIR}"
fi

if [[ ! -f  ./../.env ]] && [[ ! -f  ./../.env.prod ]]
then
  echo "ERROR: Not found .env.prod file in root folder project at: ${SCRIPT_ROOT_DIR}"
  echo "Please create .env.prod from .env.example file in root folder project at: ${SCRIPT_ROOT_DIR}"
  exit 1
fi

if [[ -f  ./../.env.prod ]]
then
  set -o allexport
	eval $(cat './../.env.prod' | sed -e '/^#/d;/^\s*$/d' -e 's/\(\w*\)[ \t]*=[ \t]*\(.*\)/\1=\2/' -e "s/=['\"]\(.*\)['\"]/=\1/g" -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
	set +o allexport
else
  echo "ERROR: Not found .env.prod file in root folder project at: ${SCRIPT_ROOT_DIR}"
  echo "Please create .env.prod from .env.example file in root folder project at: ${SCRIPT_ROOT_DIR}"
  exit 1
fi

sleep 1

echo "Build docker-compose service image without cache"
DOCKER_BUILDKIT=0 DOCKER_SCAN_SUGGEST=false docker-compose -f docker-compose.prod.yml build --no-cache

sleep 1

echo "Config .env, build image success ...."
echo $'\n\nPlease run command below to start up service: \n./infra/up-prod.sh\n\n'
