import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { AppProps as NextAppProps } from 'next/app';
import { useRouter } from 'next/router';
import { FC, useEffect, useMemo, useState } from 'react';
import { MAINNET_ENDPOINT, MAINNET_USDC_MINT } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import { USDCIcon } from '../images/USDCIcon';
import css from './App.module.css';

const App: FC<NextAppProps> = ({ Component, pageProps }) => {
    const router = useRouter();
    const [host, setHost] = useState('pos.milysec.com');

    useEffect(() => {
        setHost(window.location.host);
    }, []);

    const query = router.query;
    const baseURL = `https://${host}`;

    const connectWallet = false;
    const network = WalletAdapterNetwork.Mainnet;
    const wallets = useMemo(
        () => (connectWallet ? [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })] : []),
        [connectWallet, network]
    );

    const link = undefined;

    const recipientParam = typeof query.recipient === 'string' ? query.recipient : undefined;
    const label = typeof query.label === 'string' ? query.label : undefined;
    const message = typeof query.message === 'string' ? query.message : undefined;
    const tokenParam = typeof query.token === 'string' ? query.token : typeof query['spl-token'] === 'string' ? query['spl-token'] : undefined;

    let recipient: PublicKey | undefined;
    if (recipientParam && label) {
        try {
            recipient = new PublicKey(recipientParam);
        } catch (error) {
            console.error(error);
        }
    }

    let splToken = MAINNET_USDC_MINT;
    if (tokenParam) {
        try {
            splToken = new PublicKey(tokenParam);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ThemeProvider>
            <FullscreenProvider>
                {recipient && label ? (
                    <ConnectionProvider endpoint={MAINNET_ENDPOINT}>
                        <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                            <WalletModalProvider>
                                <ConfigProvider
                                    baseURL={baseURL}
                                    link={link}
                                    recipient={recipient}
                                    label={label}
                                    message={message}
                                    splToken={splToken}
                                    symbol="USDC"
                                    icon={<USDCIcon />}
                                    decimals={6}
                                    minDecimals={2}
                                    connectWallet={connectWallet}
                                >
                                    <TransactionsProvider>
                                        <PaymentProvider>
                                            <Component {...pageProps} />
                                        </PaymentProvider>
                                    </TransactionsProvider>
                                </ConfigProvider>
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                ) : (
                    <div className={css.logo}>
                        <SolanaPayLogo width={240} height={88} />
                    </div>
                )}
            </FullscreenProvider>
        </ThemeProvider>
    );
};

export default App;
