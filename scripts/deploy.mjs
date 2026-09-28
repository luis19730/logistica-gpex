import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repo = process.cwd();
const dist = resolve(repo, "dist");
const remote = process.env.GIT_REMOTE || "origin";
const branch = process.env.PAGES_BRANCH || "gh-pages";
const base = process.env.PAGES_URL || `https://luis19730.github.io/${process.env.PAGES_REPO || "logistica-gpex"}/`;

function git(args, cwd = repo) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function remoteHasRef(ref) {
  try {
    execFileSync("git", ["ls-remote", "--exit-code", "--heads", remote, ref], { cwd: repo, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function countFiles(dir) {
  let total = 0;
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) total += countFiles(join(dir, item.name));
    else total += 1;
  }
  return total;
}

if (!existsSync(join(repo, ".git"))) {
  console.error("deploy: rode dentro de um repositorio git com remote configurado");
  process.exit(1);
}

if (!existsSync(join(dist, "index.html"))) {
  console.error("deploy: dist/ nao existe, rode 'npm run build' antes");
  process.exit(1);
}

const indexHtml = readFileSync(join(dist, "index.html"), "utf8");
const asset = indexHtml.match(/assets\/index-[A-Za-z0-9_-]+\.js/);
console.log(`deploy: build ${asset ? asset[0] : "(bundle nao identificado)"}, ${countFiles(dist)} arquivos`);

const work = mkdtempSync(join(tmpdir(), "gpex-pages-"));
const startPoint = remoteHasRef(`refs/heads/${branch}`) ? `origin/${branch}` : "HEAD";

try {
  git(["worktree", "add", "--detach", work, startPoint]);

  for (const item of readdirSync(work)) {
    if (item === ".git") continue;
    rmSync(join(work, item), { recursive: true, force: true });
  }

  cpSync(dist, work, { recursive: true });
  writeFileSync(join(work, ".nojekyll"), "");
  git(["add", "-A"], work);

  if (!git(["status", "--porcelain"], work)) {
    console.log(`deploy: nada mudou, ${branch} ja esta atualizado`);
  } else {
    git(["-c", "user.name=luis19730", "-c", "user.email=luis19730@gmail.com", "commit", "-q", "-m", "Deploy: dist/"], work);
    git(["push", "-q", remote, `HEAD:refs/heads/${branch}`], work);
    console.log(`deploy: ${branch} publicado em ${git(["rev-parse", "--short", "HEAD"], work)}`);
  }

  console.log(`deploy: ${base}`);
} catch (error) {
  const detail = error.stderr ? String(error.stderr).trim() : error.message;
  console.error(`deploy: falhou - ${detail}`);
  process.exitCode = 1;
} finally {
  try {
    git(["worktree", "remove", "--force", work]);
    git(["worktree", "prune"]);
  } catch {
    rmSync(work, { recursive: true, force: true });
  }
}
