import axios, { AxiosResponse } from "axios";

const COINGECKO_API_ENDPOINT = "https://api.coingecko.com/api/v3";

interface NearToUSDRatioResponseData {
  near: {
    usd: number;
  };
}

export async function getNearToUSDRatio(): Promise<number> {
  const result: AxiosResponse = await axios({
    method: "get",
    url: `${COINGECKO_API_ENDPOINT}/simple/price?ids=near&include_last_updated_at=true&vs_currencies=usd`,
  });
  const data = result?.data as NearToUSDRatioResponseData;
  return Number(data?.near?.usd) || 0;
}
