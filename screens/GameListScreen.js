import React from 'react'

import GameList from './../components/GameList'

// import styles from '../shared/styles'

export default class GameListScreen extends React.Component {
  render = () => {
    const { navigate } = this.props.navigation
    const { games } = this.props.navigation.state.params
    return <GameList navigation={{ navigate }} games={games} />
  }
}
