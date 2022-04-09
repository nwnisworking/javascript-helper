/**
 * KeyPair class
 * @version 1.0.0
 *
 * Keypair acts as a quick generator for Web Crypto and allows user to sign and verify without needing to use endless variables 
 */
export default class KeyPair{
	name
	private_key
	public_key
	option
	hash

	static SHA256 = 'SHA-256'
	static SHA384 = 'SHA-384'
	static SHA512 = 'SHA-512'

	static PRIME256V1 = 'P-256'
	static SECP384R1 = 'P-384'
	static SECP521R1 = 'P-521'

	constructor(name, hash, option = {}){
		this.name = name
		this.hash = hash
		this.option = option
	}

	async sign(text){
		return this.#decode(await crypto.subtle.sign({
			name : this.name, 
			...this.option
		},this.private_key, this.#encode(text)))
	}

	async verify(text, sign){
		
		return await crypto.subtle.verify({
			name : this.name, 
			...this.option
		}, this.public_key, this.#encode(sign), this.#encode(text))
	}

	async exportKeys(type = 'raw'){
		
		if(type == 'raw'){
			const {private_key, public_key} = this
			return {
				private_key : new Uint8Array(await crypto.subtle.exportKey('pkcs8', private_key)),
				public_key : new Uint8Array(await crypto.subtle.exportKey('spki', public_key))
			}
		}
		else if(type == 'string'){
			const {private_key, public_key} = await this.exportKeys('raw')
			return {
				private_key : this.#decode(private_key),
				public_key : this.#decode(public_key)
			}
		}
		else if(type == 'rsa'){
			let {private_key, public_key} = await this.exportKeys('string'),
			str = (typ, key)=>{
				return `-----BEGIN ${typ} KEY-----\r\n` + 
				key +  
				`-----END ${typ} KEY-----`
			}
			private_key = btoa(private_key).match(/.{0,64}/g).join('\r\n')
			public_key = btoa(public_key).match(/.{0,64}/g).join('\r\n')
			
			return {
				private_key : str('PRIVATE', private_key),
				public_key : str('PUBLIC', public_key)
			}
		}
	}

	#encode(text){
		return Uint8Array.from(text.split('').map(e=>e.charCodeAt(0)))
	}

	#decode(buf){
		return String.fromCharCode(...new Uint8Array(buf))
	}

	static async PSS(hash, salt_length = 32, modulus_length = 2048){

		const kp = new this('RSA-PSS', hash, {saltLength : salt_length}),
		{privateKey, publicKey} = await crypto.subtle.generateKey({
			name : kp.name,
			modulusLength : modulus_length,
			publicExponent : new Uint8Array([1,0,1]),
			hash
		}, true, ['sign', 'verify'])
	
		kp.private_key = privateKey
		kp.public_key = publicKey

		return kp
	}

	static async ECDSA(hash, named_curve){
		const kp = new this('ECDSA', hash, {hash}),
		{privateKey, publicKey} = await crypto.subtle.generateKey({
			name : kp.name,
			namedCurve : named_curve
		}, true, ['sign', 'verify'])

		kp.private_key = privateKey
		kp.public_key = publicKey

		return kp
	}

	static async PKCS(hash, modulus_length = 2048){
		const kp = new this('RSASSA-PKCS1-v1_5', hash, {}),
		{privateKey, publicKey} = await crypto.subtle.generateKey({
			name : kp.name,
			hash,
			publicExponent : new Uint8Array([1,0,1]),
			modulusLength : modulus_length
		}, true, ['verify', 'sign'])

		kp.private_key = privateKey
		kp.public_key = publicKey

		return kp
	}
}
