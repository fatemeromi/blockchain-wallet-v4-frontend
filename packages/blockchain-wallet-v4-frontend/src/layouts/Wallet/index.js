import React from 'react'
import { connect } from 'react-redux'
import { compose, bindActionCreators } from 'redux'
import { Route, Redirect } from 'react-router-dom'
import ui from 'redux-ui'

import { actions, selectors } from 'data'
import WalletLayout from './template'

class WalletLayoutContainer extends React.PureComponent {
  componentWillMount () {
    // this is needed because otherwise sign up calls two times component will mount (investigate why)
    this.props.kvStoreBchActions.fetchMetadataBch()
    this.props.kvStoreEthereumActions.fetchMetadataEthereum()
    this.props.kvStoreWhatsnewActions.fetchMetadataWhatsnew()
    this.props.kvStoreShapeshiftActions.fetchMetadataShapeshift()
    this.props.settingsActions.fetchSettings()
  }

  render () {
    const { updateUI, isAuthenticated, path, component: Component } = this.props
    console.log('render Layout')

    return isAuthenticated
      ? <Route path={path} render={props => (
        <WalletLayout
          location={props.location}
          menuLeftToggled={ui.menuLeftToggled}
          trayRightOpen={ui.trayRightOpen}
          trayRightContent={ui.trayRightContent}
          handleTrayRightToggle={(content, fromClickOutside) => {
            // if (fromClickOutside) {
            //   updateUI({ trayRightOpen: false })
            // } else if (content && ui.trayRightOpen && ui.trayRightContent !== content) {
            //   updateUI({ trayRightContent: content })
            // } else if (ui.trayRightOpen && !content) {
            //   updateUI({ trayRightOpen: false })
            // } else {
            //   updateUI({ trayRightOpen: !ui.trayRightOpen, trayRightContent: content })
            // }
          }}
          handleToggleMenuLeft={() => updateUI({ menuLeftToggled: !ui.menuLeftToggled })}
          handleCloseMenuLeft={() => updateUI({ menuLeftToggled: false })}>
          <Component />
        </WalletLayout>
      )} />
      : <Redirect to={{ pathname: '/login', state: { from: '' } }} />
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: selectors.auth.isAuthenticated(state)
})

const mapDispatchToProps = (dispatch) => ({
  kvStoreBchActions: bindActionCreators(actions.core.kvStore.bch, dispatch),
  kvStoreEthereumActions: bindActionCreators(actions.core.kvStore.ethereum, dispatch),
  kvStoreShapeshiftActions: bindActionCreators(actions.core.kvStore.shapeShift, dispatch),
  kvStoreWhatsnewActions: bindActionCreators(actions.core.kvStore.whatsNew, dispatch),
  optionsActions: bindActionCreators(actions.core.walletOptions, dispatch),
  settingsActions: bindActionCreators(actions.core.settings, dispatch)
})

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  ui({
    key: 'WalletLayout',
    persist: true,
    state: {
      menuLeftToggled: false,
      trayRightOpen: false,
      trayRightContent: ''
    }
  })
)

export default enhance(WalletLayoutContainer)
