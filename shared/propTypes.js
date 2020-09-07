import PropTypes from 'prop-types'

export const navigationType = {
  navigation: PropTypes.shape({
    setParams: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    setOptions: PropTypes.func,
  }).isRequired,
}

export const routeType = (params) => ({
  route: PropTypes.shape({
    params: PropTypes.shape({
      ...params,
    }),
  }),
})
