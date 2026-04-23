#!/bin/bash
#!/bin/sh
# Author: bao.hq
# Company: Tekup JSC
# Phone: 0333 365 777
# This file will help restart docker-compose service only

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

if [[ -f  ./../.env.prod ]]
then
  set -o allexport
	eval $(cat './../.env.prod' | sed -e '/^#/d;/^\s*$/d' -e 's/\(\w*\)[ \t]*=[ \t]*\(.*\)/\1=\2/' -e "s/=['\"]\(.*\)['\"]/=\1/g" -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
	set +o allexport
else
  echo "ERROR: Not found .env.prod file in root folder project at: ${SCRIPT_ROOT_DIR}"
  echo "Please create .env.prod file in root folder project at: ${SCRIPT_ROOT_DIR}"
  exit 1
fi

echo "This file will help restart docker-compose service only, not build new image version"
echo "Restart service ..."

sleep 1

echo "1. Stop docker-compose service, remove volume"
docker-compose -f docker-compose.prod.yml down -v

sleep 1

echo "2. Start docker-compose service in daemon"
docker-compose -f docker-compose.prod.yml up  -d

sleep 1

echo "Success ...."