//변경필요

const express = require('express')
const fs = require('fs')
const { ethers } = require('ethers')

const erc721Address = '0x1042cde4f1165abff05af0DaaEF57086CDe06638' // BloKatzv1(NotSale)
const abi = require('./abi')
const cors = require('cors')
const port = 5500

const app = express()
app.use(cors())

const run = async () => {
	const provider = new ethers.getDefaultProvider(
		'https://ropsten.infura.io/v3/314f0bdea36c470f9f9ca75759f5204c',
	)
	const NFT = new ethers.Contract(erc721Address, abi, provider)
	const names = fs.readdirSync('./json')
	const jsons = new Map()

	for (const name of names) {
		const jsonFile = fs.readFileSync(`./json/${name}`, 'utf8')
		jsons.set(name, JSON.parse(jsonFile))
	}

	app.get('/:id', async (req, res) => {
		const id = req.params.id
		const total = await NFT.totalSupply()
		if (Number(id) <= total.toNumber()) {
			res.status(200).json(jsons.get(id))
		} else {
			res.status(404).send('NO!')
		}
	})

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	})
}

run()
