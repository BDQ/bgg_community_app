import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import Hotness from './Hotness'
import CrowdFunding from './CrowdFunding'

import { Icon } from 'react-native-elements'



import GameList from '../../components/GameList'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'

const ExploreScreen = (props) => {
    return (
        <ScrollView>
            <Hotness navigation={props.navigation} />
            <CrowdFunding navigation={props.navigation} />
        </ScrollView>
    )
}




export default ExploreScreen
