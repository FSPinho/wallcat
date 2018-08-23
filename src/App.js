import React from 'react';
import { I18nextProvider } from 'react-i18next';
import RNLanguages from 'react-native-languages';
import { WallpaperGenerator } from './pages';
import { i18n } from './services';
import { ThemeProvider } from './theme';

class App extends React.Component {

    async componentWillMount() {
        RNLanguages.addEventListener('change', this.onLanguagesChange)
    }

    componentWillUnmount() {
        RNLanguages.removeEventListener('change', this.onLanguagesChange)
    }

    onLanguagesChange = ({ language }) => {
        i18n.changeLanguage(language)
    }

    render() {
        return (
            <I18nextProvider i18n={i18n}>
                <ThemeProvider>
                    <WallpaperGenerator />
                </ThemeProvider>
            </I18nextProvider>
        )
    }
}

export default App