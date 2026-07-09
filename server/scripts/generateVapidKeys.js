import webpush from 'web-push'

const keys = webpush.generateVAPIDKeys()

console.log('\nAdd these to your server/.env (and the public key to client/.env too):\n')
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log('VAPID_SUBJECT=mailto:youremail@example.com\n')
console.log('Also set on the client side (client/.env):')
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}\n`)
