import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import Hotness from './ExploreComponents/Hotness'
import CrowdFunding from './ExploreComponents/CrowdFunding'
import HomeList from './ExploreComponents/HomeList'
import AllTimeList from './ExploreComponents/AllTimeList'
import { Icon } from 'react-native-elements'



import GameList from '../../components/GameList'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'


const ExploreScreen = (props) => {
    let [homeListId, setHomeListId] = useState(null)
    let [homeListId2, setHomeListId2] = useState(null)


    useEffect(() => {
        if (!homeListId && !homeListId2) {
            fetchHomeListIds()
        }

    })

    const fetchHomeListIds = () => {
        fetch("https://api.geekdo.com/api/homegamelists").then(ids => {
            ids.json().then(idJson => {
                var randInd = Math.floor(Math.random() * (idJson.length - 1))
                setHomeListId(idJson[randInd].id)
                setHomeListId2(idJson[randInd + 1].id)

            })
        })
    }


    return (
        <ScrollView>
            <Hotness navigation={props.navigation} />
            <CrowdFunding navigation={props.navigation} />
            <AllTimeList navigation={props.navigation} />
            {homeListId ?
                <HomeList navigation={props.navigation} listId={homeListId} />
                : null}
            {homeListId2 ?
                <HomeList navigation={props.navigation} listId={homeListId2} />
                : null}
        </ScrollView>
    )
}




export default ExploreScreen
