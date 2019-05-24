import { StyleSheet } from 'react-native'
export default StyleSheet.create({
  emptyView: {
    flex: 1,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },

  mainView: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff'
  },

  formHeader: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
    paddingBottom: 10
  },
  formLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold'
  },
  formLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8
  },
  formButtons: {
    marginTop: 30,
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  toggleText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 10
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline'
  }
})
