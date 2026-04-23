#!/bin/bash
#!/bin/sh
# Author: bao.hq
# Company: Tekup JSC
# Phone: 0333 365 777
# This file will help build docker-compose service image version only

SCRIPT_PATH="${BASH_SOURCE}"
while [ -L "${SCRIPT_PATH}" ]; do
  SCRIPT_DIR="$(cd -P "$(dirname "${SCRIPT_PATH}")" >/dev/null 2>&1 && pwd)"
  SCRIPT_PATH="$(readlink "${SCRIPT_PATH}")"
  [[ ${SCRIPT_PATH} != /* ]] && SCRIPT_PATH="${SCRIPT_DIR}/${SCRIPT_PATH}"
done
# SCRIPT_PATH="$(readlink -f "${SCRIPT_PATH}")"
SCRIPT_DIR="$(cd -P "$(dirname -- "${SCRIPT_PATH}")" >/dev/null 2>&1 && pwd)"
SCRIPT_ROOT_DIR="${SCRIPT_PATH}/../"
SCRIPT_ROOT_DIR="$(pwd "${SCRIPT_RxOOT_DIR}")"
# echo "SCRIPT_PATH $SCRIPT_PATH"
# echo "SCRIPT_DIR $SCRIPT_DIR"
# echo "SCRIPT_ROOT_DIR $SCRIPT_ROOT_DIR"

cd $SCRIPT_DIR

echo "This file will help build docker-compose service image version only"
echo "Build image service ..."

sleep 1

if [[ ! -f  ./../.env.dev ]] && [[ -f  ./../.env ]]
then
  cp ./../.env ./../.env.dev
  echo "WARNING: Not found .env.dev file in root folder project at: ${SCRIPT_ROOT_DIR}"
  echo "We use .env content to create .env.dev file at: ${SCRIPT_ROOT_DIR}"
fi

if [[ ! -f  ./../.env.dev ]]
then
  echo "ERROR: Not found .env.dev file in root folder project at: ${SCRIPT_ROOT_DIR}"
  echo "Please create .env.dev from .env.example file in root folder project at: ${SCRIPT_ROOT_DIR}"
  exit 1
else
	set -o allexport
	eval $(cat './../.env.dev' | sed -e '/^#/d;/^\s*$/d' -e 's/\(\w*\)[ \t]*=[ \t]*\(.*\)/\1=\2/' -e "s/=['\"]\(.*\)['\"]/=\1/g" -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
	set +o allexport
fi

sleep 1

echo "1. Build docker-compose service image without cache"
DOCKER_BUILDKIT=0 DOCKER_SCAN_SUGGEST=false docker-compose -f docker-compose.dev.yml build --no-cache

exit $?

sleep 1

echo "Success ...."