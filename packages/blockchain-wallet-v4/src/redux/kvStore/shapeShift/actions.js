import * as AT from './actionTypes'

// ADD_TRADE_METADATA_SHAPESHIFT
export const addTradeMetadataShapeshift = (trade) => ({ type: AT.ADD_TRADE_METADATA_SHAPESHIFT, payload: { trade } })

// UPDATE_TRADE_METADATA_SHAPESHIFT
export const updateTradeMetadataShapeshift = (orderId, trade) => ({ type: AT.UPDATE_TRADE_METADATA_SHAPESHIFT, payload: { orderId, trade } })

// FETCH_METADATA_SHAPESHIFT
export const fetchMetadataShapeshift = () => ({ type: AT.FETCH_METADATA_SHAPESHIFT })
export const fetchMetadataShapeshiftLoading = () => ({ type: AT.FETCH_METADATA_SHAPESHIFT_LOADING })
export const fetchMetadataShapeshiftSuccess = (data) => ({ type: AT.FETCH_METADATA_SHAPESHIFT_SUCCESS, payload: data })
export const fetchMetadataShapeshiftFailure = (error) => ({ type: AT.FETCH_METADATA_SHAPESHIFT_FAILURE, payload: error })

export const createMetadataShapeshift = (data) => ({ type: AT.CREATE_METADATA_SHAPESHIFT, payload: data })
