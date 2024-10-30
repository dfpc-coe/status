import fs from 'node:fs';
import { Static } from '@sinclair/typebox';
import { Issue, Health } from './src/types.js';

if (!process.env.GITHUB_ISSUE) throw new Error('GITHUB_ISSUE Env Var must be set')

const issue = JSON.parse(process.env.GITHUB_ISSUE)

let health = Health.GREEN;

const labels = issue.labels.map((label) => { return label.description });

if (labels.includes('red')) health = Health.RED;
if (labels.includes('yellow')) health = Health.YELLOW;

if (!fs.existsSync(new URL('issues/', import.meta.url))){
    fs.mkdirSync(new URL('issues/', import.meta.url));
}

const issue: Static<typeof Issue> = {
    id: issue.number,
    username: issue.user.login,
    health,
    start: issue.created_at,
    end: issue.closed_at || undefined,
    title: issue.title,
    body: issue.body
}

fs.writeFileSync(new URL(`issues/${issue.number}.json`, import.meta.url), JSON.stringify(issue, null, 4));

const config = JSON.parse(String(fs.readFileSync(new URL(`./config.json`, import.meta.url))))

for (const service of services) {
    if (labels.includes(service.id)) {
        // Handle Label being added to issue
        service.issues.push(issue.id)
    } else if (service.issues.includes(issue.id) {
        // Handle Label being removed from issue
        service.issues.splice(service.issues.indexOf(issue.id), 1)
    }
}

fs.writeFileSync(new URL(`./config.json`, import.meta.url), JSON.stringify(config, null, 4))
