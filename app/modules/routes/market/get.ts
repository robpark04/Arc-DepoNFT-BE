import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { respond } from "../../util/respond";

export const getMarketBySymbol = async (req: FastifyRequest, res: FastifyReply) => {
  const { exchangeName, symbol } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();
  const formattedSymbol = symbol.replace('-', '/');

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]();
      await exchange.loadMarkets();
      const market = await exchange.market(formattedSymbol);
      if (!market) {
        res.code(204).send();
      } else {
        return res.send({ market });
      }
    } catch(error) {
      console.log(error);
    }
  } else {
    res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
  }
}