import { request, gql } from 'graphql-request'
import { INFO_CLIENT } from 'config/constants/endpoints'
import { Transaction } from 'state/info/types'
import { MintResponse, SwapResponse, BurnResponse } from 'state/info/queries/types'
import { mapMints, mapBurns, mapSwaps } from 'state/info/queries/helpers'
import { ChainId } from 'sdk'

/**
 * Data to display transaction table on Token page
 */
const TOKEN_TRANSACTIONS = gql`
    query tokenTransactions($address: Bytes!) {
        mintsAs0: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_: {token0: $address }}) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            to
            amount0
            amount1
            amountUSD
        }
        mintsAs1: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_: {token1: $address }}) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            to
            amount0
            amount1
            amountUSD
        }
        swapsAs0: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_: {token0: $address }}) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            from
            amount0In
            amount1In
            amount0Out
            amount1Out
            amountUSD
        }
        swapsAs1: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_: {token1: $address }}) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            from
            amount0In
            amount1In
            amount0Out
            amount1Out
            amountUSD
        }
        burnsAs0: burns(first: 10, orderBy: timestamp, orderDirection: desc, where:{ pair_: {token0: $address }}) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            sender
            amount0
            amount1
            amountUSD
        }
        burnsAs1: burns(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_: {token1: $address }}) {
            id
            timestamp
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            sender
            amount0
            amount1
            amountUSD
        }
    }
`

interface TransactionResults {
    mintsAs0: MintResponse[]
    mintsAs1: MintResponse[]
    swapsAs0: SwapResponse[]
    swapsAs1: SwapResponse[]
    burnsAs0: BurnResponse[]
    burnsAs1: BurnResponse[]
}

const fetchTokenTransactions = async (chainId: ChainId, address: string): Promise<{ data?: Transaction[]; error: boolean }> => {
    try {
        const data = await request<TransactionResults>(INFO_CLIENT[chainId], TOKEN_TRANSACTIONS, {
            address,
        })
        const mints0 = data.mintsAs0.map((mint) => mapMints(mint, chainId))
        const mints1 = data.mintsAs1.map((mint) => mapMints(mint, chainId))

        const burns0 = data.burnsAs0.map((burn) => mapBurns(burn, chainId))
        const burns1 = data.burnsAs1.map((burn) => mapBurns(burn, chainId))

        const swaps0 = data.swapsAs0.map((swap) => mapSwaps(swap, chainId))
        const swaps1 = data.swapsAs1.map((swap) => mapSwaps(swap, chainId))

        return { data: [...mints0, ...mints1, ...burns0, ...burns1, ...swaps0, ...swaps1], error: false }
    } catch (error) {
        console.error(`Failed to fetch transactions for token ${address}`, error)
        return {
            error: true,
        }
    }
}

export default fetchTokenTransactions