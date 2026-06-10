import {
  featureBlocks,
  getAllBlockSlugs,
  getBlockBySlug,
  getFeatureBlocks,
} from '../blocks'

export const plugins = featureBlocks

export const getPluginBySlug = getBlockBySlug
export const getAllPluginSlugs = getAllBlockSlugs

export { getFeatureBlocks, getBlockBySlug, getAllBlockSlugs, featureBlocks }
