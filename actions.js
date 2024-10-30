if (!process.env.GITHUB_ISSUE) throw new Error('GITHUB_ISSUE Env Var must be set')

console.error(process.env.GITHUB_ISSUE)
