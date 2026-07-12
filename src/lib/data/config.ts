interface Config {
    backendUrl: string
}

const config:Config = {
    backendUrl: `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
}

export default config