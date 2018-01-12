const koa=require('koa')
const route=require('koa-route')
const timeout=require('koa-timeout')(1000000)
const agent=require('superagent')
const cheerio=require('cheerio')
const port=8088
const app=new koa()
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
app.use(timeout)
app.use(route.get('/',(ctx,next)=>{
	console.time('requestTime')
	agent.get('http://www.casad.cas.cn/chnl/371/index.html')
	.end(async (err,data)=>{
		if(err){
			next(err)
		}
		let $=cheerio.load(data.text)
		allLink=$("#allNameBar a")
		allLink=allLink[10]
		let allUrl=[]
		console.log(allLink)
		// allLink.each((index,item)=>{
		// 	if(index<3){
		// 		return
		// 	}else{
		// 		let url=$(item).attr('href')
		// 		allUrl.push(requestInfo(url))		
		// 		return	
		// 	}	
		// })
		// for(let i=0;i<allLink.length;i++){
		// 	if(i<3){
		// 		continue
		// 	}else{
		// 		let url=allLink[i].attr('href')
		// 		allUrl.push(await requestInfo(url))
		// 		continue
		// 	}
		// }
		let url=allLink.attr('href')
		allUrl.push(await requestInfo(url))
		ctx.body=allUrl
		// Promise.all(allUrl)
		// .then((pages)=>{
		// 	let infoData=[]
		// 	pages.forEach((html)=>{
		// 		let $=cheerio.load(html.text)
		// 		let info={}
		// 		let name=$('.contentBar .title h1').text()
		// 		info.name=name
		// 		let intro=$("#zoom p")		
		// 		info.intro=intro.text()				
		// 		infoData.push(info)
		// 	})
		// 	console.timeEnd('requestTime')
		// 	ctx.body=infoData
			
		// })
		// .catch((erro)=>{
		// 	ctx.body=erro
		// })
	})
}))
app.listen(port,()=>{
	console.log('koa-app listen on port:'+port)
})