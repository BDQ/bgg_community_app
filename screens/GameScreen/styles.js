import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  itemContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  gameHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    height: 300
  },
  headerRatings: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  headerRatingsText: {
    paddingTop: 2,
    color: '#ffffff',
    height: 20
  },
  headerImage: {
    width: '90%',
    height: '92%'
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  statsBoxRight: {
    borderRightWidth: 1
  },
  statsBoxTop: {
    borderTopWidth: 1
  },
  statsBox: {
    borderColor: '#BEBFC0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    width: '50%',
    height: 65
  },
  statsTitle: {
    fontFamily: 'lato-bold',
    color: '#282D5C',
    width: '100%',
    textAlign: 'center',
    fontSize: 16
  },
  statsText: {
    fontFamily: 'lato',
    color: '#004FAE',
    width: '100%',
    textAlign: 'center',
    fontSize: 12
  },
  creditText: {
    fontFamily: 'lato'
  },
  creditTitle: {
    fontFamily: 'lato-bold'
  },
  descriptionHeader: {
    borderBottomColor: '#292e62',
    borderBottomWidth: 1,
    marginBottom: 10
  },
  descriptionHeaderText: {
    fontFamily: 'lato-bold',
    fontSize: 18,
    color: '#292e62',
    marginBottom: 10
  },
  headerButton: {
    backgroundColor: '#fff'
  },
  headerButtonText: { fontFamily: 'lato-bold', fontSize: 14, color: '#000' },
  headerButtonContainer: { width: 130, marginRight: 5 }
})
