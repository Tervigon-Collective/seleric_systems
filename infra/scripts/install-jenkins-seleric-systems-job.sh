#!/usr/bin/env bash
# Register or refresh the Jenkins "seleric-systems" deploy job.
# On the Jenkins host, run:
#   sudo bash /srv/seleric/deploy/install-jenkins-seleric-systems-job.sh
#
# This wrapper keeps the repo in sync with the server install script.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVER_INSTALL="/srv/seleric/deploy/install-jenkins-seleric-systems-job.sh"

if [[ -x "${SERVER_INSTALL}" ]]; then
  exec sudo bash "${SERVER_INSTALL}"
fi

if [[ "${EUID:-}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  echo "Or install server script at ${SERVER_INSTALL}" >&2
  exit 1
fi

exec sudo bash "${ROOT}/infra/scripts/install-jenkins-seleric-systems-job.sh"
