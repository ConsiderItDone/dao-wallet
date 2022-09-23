import React from 'react'
import Header from '../header'
import './index.css'


const UnlockWalletPage = () => {
    return <div className='unlockWalletPageContainer'>
        <Header/>
        <div className='body'>
            <div className='title'>Unlock your Wallet</div>
            <div className='secondaryTitle'>
                Unlock your device & open NEAR App <br/> to connect Ledger
            </div>
            <div className='icon'/>
            <button type='button' className='connect'>Connect Ledger</button>
            <button type='button' className='cancel'>Cancel</button>
        </div>
    </div>
}

export default UnlockWalletPage