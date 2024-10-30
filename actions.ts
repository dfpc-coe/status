import fs from 'node:fs';
import { Health } from './src/types.js';

if (!process.env.GITHUB_ISSUE) throw new Error('GITHUB_ISSUE Env Var must be set')

const issue = JSON.parse(process.env.GITHUB_ISSUE)

let health = Health.GREEN;

const labels = issue.labels.map((label) => { return label.description });

if (labels.includes('red')) health = Health.RED;
if (labels.includes('yellow')) health = Health.YELLOW;

if (!fs.existsSync(new URL('issues/', import.meta.url))){
    fs.mkdirSync(new URL('issues/', import.meta.url));
}

fs.writeFileSync(new URL(`issues/${issue.number}`, import.meta.url), JSON.stringify({
    id: issue.number,
    username: issue.user.login,
    health,
    start: issue.created_at,
    end: issue.closed_at || undefined,
    title: issue.title,
    body: issue.body
}, null, 4));

