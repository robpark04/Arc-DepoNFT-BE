import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";


const loadBinanceOrders = async (marketType, userData, symbol) => {
  try{
    const exchange = new ccxt.binance();
    exchange.options.defaultType = marketType; 
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;
    await exchange.checkRequiredCredentials() // throw AuthenticationError

    const responseBinance = {
      openOrders: await exchange.fetchOpenOrders(symbol),
      closedOrders: await exchange.fetchClosedOrders(symbol),
    }
  
    // if(marketType === 'future') {
    //   responseBinance.openOrders = responseBinance.openOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
    //   responseBinance.closedOrders = responseBinance.closedOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
    // }

    responseBinance.openOrders.forEach((order: any) => {
      order.exchange = 'Binance';
      order.info.status = order.status;
    });
  
    responseBinance.closedOrders.forEach((order: any) =>{
      order.exchange = 'Binance';
      order.info.status = order.status;
    });

    return responseBinance;
  }catch(err){
    console.log(err)
  }
};

const loadHuobiOrders = async (marketType, userData, symbol) => {
  try{
  const exchange = new ccxt.huobi();
  exchange.options.defaultType = marketType;
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  await exchange.checkRequiredCredentials() // throw AuthenticationError

  const responseHuobi = {
    openOrders: await exchange.fetchOpenOrders(symbol),
    closedOrders: await exchange.fetchClosedOrders(symbol),
  }

  // if(marketType === 'future') {
  //   responseHuobi.openOrders = responseHuobi.openOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
  //   responseHuobi.closedOrders = responseHuobi.closedOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
  // }

  responseHuobi.openOrders.forEach((order: any) => {
    order.exchange = 'Huobi';
    order.info.status = order.status;
  });

  responseHuobi.closedOrders.forEach((order: any) =>{
    order.exchange = 'Huobi';
    order.info.status = order.status;
  });

  return responseHuobi;
}catch(err) {
  console.log(err)
}

};

const loadFTXOrders = async (marketType, userData, symbol) => {
  try {
  const exchange = new ccxt.ftx();
  exchange.options.defaultType = marketType;
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;

  if(userData.extraFields.length > 0){
    const userSubAccount = userData.extraFields.find(field => field.fieldName === 'Subaccount');
    exchange.headers = {
      'FTX-SUBACCOUNT': userSubAccount.value,
    }
  }

  await exchange.checkRequiredCredentials() // throw AuthenticationError
  const orderList = await exchange.fetchOrders();

  const responseFTX = {
    openOrders: orderList.filter(order => order.info.status !== 'closed' && order.symbol === symbol),
    closedOrders: orderList.filter(order => order.info.status === 'closed' && order.symbol === symbol),
  }

  // if(marketType === 'future') {
  //   responseFTX.openOrders = responseFTX.openOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
  //   responseFTX.closedOrders = responseFTX.closedOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
  // }

  responseFTX.openOrders.forEach((order: any) => order.exchange = 'FTX' );
  responseFTX.closedOrders.forEach((order: any) => order.exchange = 'FTX' );

  return responseFTX;
} catch(err){
  console.log(err)
}
};

const getKucoinOrders = async (marketType, userData, symbol) => {
  const exchange = new ccxt.kucoin();
  exchange.options.defaultType = marketType;
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.password = userData.passphrase;
 
  await exchange.checkRequiredCredentials() // throw AuthenticationError

  const responseKucoin = {
    openOrders: await exchange.fetchOpenOrders(symbol),
    closedOrders: await exchange.fetchClosedOrders(symbol),
  }

  // if(marketType === 'future') {
  //   responseKucoin.openOrders = responseKucoin.openOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
  //   responseKucoin.closedOrders = responseKucoin.closedOrders.filter((order: any) => order.info.future && order.info.future !== null ) 
  // }

  responseKucoin.openOrders.forEach((order: any) => {
    order.exchange = 'Kucoin';
    order.info.status = order.status;
  });

  responseKucoin.closedOrders.forEach((order: any) =>{
    order.exchange = 'Kucoin';
    order.info.status = order.status;
  });

  return responseKucoin;  
}


export const loadUserOrders = async (req: FastifyRequest, res: FastifyReply) => {
  try{
  const { walletId, marketType, symbol } = req.params as any;
  const formatedSymbol = symbol.replace('-','/');
  const userController = new DepoUserController();
  const userExchanges :any = await userController.getUserApiKeys(walletId);
  const response = {
    openOrders: [],
    closedOrders: []
  }

  console.log('---------------------')
  console.log('bateu na rota no back')
  console.log(walletId)
  console.log(marketType)
  console.log(symbol)
  console.log('---------------------')

  if(!userExchanges) return res.send({});


  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'binance' )){

    const binanceResponse = await loadBinanceOrders(marketType, userExchanges.find(exchange => exchange.id.toLowerCase() === 'binance'), formatedSymbol)

    if(binanceResponse){
      response.openOrders.push(...binanceResponse.openOrders);
      response.closedOrders.push(...binanceResponse.closedOrders);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi' )){
    const responseHuobi = await loadHuobiOrders(marketType, userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi'), formatedSymbol)

    if(responseHuobi){
      response.openOrders.push(...responseHuobi.openOrders);
      response.closedOrders.push(...responseHuobi.closedOrders);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'ftx' )){
    const responseFTX = await loadFTXOrders(marketType, userExchanges.find(exchange => exchange.id.toLowerCase() === 'ftx'), formatedSymbol)

    if(responseFTX){
      response.openOrders.push(...responseFTX.openOrders);
      response.closedOrders.push(...responseFTX.closedOrders);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'kucoin' )){
    const responseKucoin = await getKucoinOrders(marketType, userExchanges.find(exchange => exchange.id.toLowerCase() === 'kucoin'), formatedSymbol)

    if(responseKucoin){
      response.openOrders.push(...responseKucoin.openOrders);
      response.closedOrders.push(...responseKucoin.closedOrders);
    }
  }


  // const ordenedResponse = {
  //   openOrders: response.openOrders.sort((a :any, b :any) =>  a.datetime - b.datetime),
  //   closedOrders: response.closedOrders.sort((a :any, b :any) =>  a.datetime - b.datetime)
  // }
  
  console.log(response)

  return res.send({ response });
}catch(err){
  console.log(err)
}
}