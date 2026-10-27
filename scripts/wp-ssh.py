#!/usr/bin/env python3
"""Run a wp-cli (or shell) command on the ANIMA WordPress host over SSH.

Reads WORDPRESS_SSH_* from .env.local at the repo root and never prints them.
The remote command runs with the WordPress directory as cwd, so wp-cli finds
the site without a --path flag.

    python3 -I scripts/wp-ssh.py "wp term list event_tag --allow-root --skip-themes"

Note on --skip-plugins: wp-cli is usually safer with it, but the mall content
types (event, brand, deal, job_offer) and their taxonomies are registered by
sanruiz-mall-core, so any command that touches them must run with plugins
loaded. See docs/backend-ssh-access.md.
"""
import os
import re
import subprocess
import sys
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent.parent / ".env.local"
REQUIRED = (
    "WORDPRESS_SSH_HOST",
    "WORDPRESS_SSH_PORT",
    "WORDPRESS_SSH_USER",
    "WORDPRESS_SSH_PASSWORD",
    "WORDPRESS_SSH_WP_PATH",
)


def read_env() -> dict[str, str]:
    """Parse the WORDPRESS_SSH_* assignments out of .env.local."""
    values: dict[str, str] = {}
    with ENV_FILE.open(encoding="utf-8") as handle:
        for line in handle:
            match = re.match(r"^\s*(WORDPRESS_SSH_[A-Z_]+)\s*=\s*(.*?)\s*$", line)
            if not match:
                continue
            value = match.group(2)
            if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                value = value[1:-1]
            values[match.group(1)] = value
    return values


def main() -> int:
    if len(sys.argv) != 2:
        sys.exit(f"uso: {sys.argv[0]} '<comando remoto>'")

    try:
        env_values = read_env()
    except OSError as error:
        sys.exit(f"no se pudo leer {ENV_FILE}: {error}")

    missing = [name for name in REQUIRED if name not in env_values]
    if missing:
        sys.exit("faltan variables en .env.local: " + ", ".join(missing))

    remote = f"cd {env_values['WORDPRESS_SSH_WP_PATH']} && {sys.argv[1]}"
    target = f"{env_values['WORDPRESS_SSH_USER']}@{env_values['WORDPRESS_SSH_HOST']}"

    try:
        proc = subprocess.run(
            [
                "sshpass", "-e", "ssh",
                "-o", "StrictHostKeyChecking=no",
                "-o", "ConnectTimeout=25",
                "-p", env_values["WORDPRESS_SSH_PORT"],
                target, remote,
            ],
            env=dict(os.environ, SSHPASS=env_values["WORDPRESS_SSH_PASSWORD"]),
            capture_output=True,
            text=True,
            timeout=300,
        )
    except FileNotFoundError:
        sys.exit("falta sshpass: brew install hudochenkov/sshpass/sshpass")
    except subprocess.TimeoutExpired:
        sys.exit("el comando remoto excedió el tiempo de espera")

    sys.stdout.write(proc.stdout)
    sys.stderr.write(proc.stderr)
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
