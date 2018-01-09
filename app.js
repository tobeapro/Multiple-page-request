const express=require('express')
const cheerio=require('cheerio')
const agent=require('superagent')
const timeout = require('connect-timeout')
const app=express()
const port=8080
function requestInfo(URL){
	return new Promise((resolve,reject)=>{
		agent.get(URL)
		.end((err,data)=>{
			if(err){
				reject(err)
			}
			resolve(data)
		})
	})
}
app.get('/',timeout('100000s'),(req,res,next)=>{
	console.time('requestTime')
	agent.get('http://www.casad.cas.cn/chnl/371/index.html')
	.end((err,data)=>{
		if(err){
			next(err)
		}
		let $=cheerio.load(data.text)
		allLink=$("#allNameBar a")
		let allUrl=[]
		allLink.each((index,item)=>{
			if(index<3){
				return
			}else{
				let url=$(item).attr('href')
				allUrl.push(requestInfo(url))
			}	
		})
		Promise.all(allUrl)
		.then((pages)=>{
			let infoData=[]
			pages.forEach((html)=>{
				let $=cheerio.load(html.text)
				let info={}
				let name=$('.contentBar .title h1').text()
				info.name=name
				let intro=$("#zoom p")		
				info.intro=intro.text()				
				infoData.push(info)
			})
			console.timeEnd('requestTime')
			res.send(infoData)
			
		})
		.catch((erro)=>{
			res.send(erro)
		})
	})
}).listen(port,()=>{
	console.log('listen on port:'+port)
})
