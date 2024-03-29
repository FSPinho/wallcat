import React from 'react';
import { translate } from 'react-i18next';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { AdMobRewarded } from 'react-native-admob';
import { GoogleAnalyticsTracker } from "react-native-google-analytics-bridge";
import ViewShot, { releaseCapture } from "react-native-view-shot";
import { Box, Page, Paper } from '../components';
import CatIcon from '../components/CatIcon';
import Fab from '../components/Fab';
import Alert from '../services/Alert';
import WallpaperManager from '../services/WallpaperManager';
import { withTheme } from '../theme';
import { palette } from '../theme/Theme';


const MAX_THEME_CHANGE_BEFORE_ADS = __DEV__ ? 2 : 8
const ANALYTICS_PREFIX = __DEV__ ? 'DEV_' : ''
const ANALYTICS_PAGE_NAME = ANALYTICS_PREFIX + 'HOME'
const ANALYTICS_EVENT_CATEGORY = ANALYTICS_PREFIX + 'COMMON'
const ANALYTICS_EVENT_GENERATE_NEW_WALLPAPER = ANALYTICS_PREFIX + 'EVENT_GENERATE_NEW_WALLPAPER'
const ANALYTICS_EVENT_CHANGE_WALLPAPER = ANALYTICS_PREFIX + 'EVENT_CHANGE_WALLPAPER'
const ANALYTICS_EVENT_SEE_ADS = ANALYTICS_PREFIX + 'EVENT_SEE_ADS'

const createTheme = (id, p, s) => ({
    id,
    background: p['700'].color,
    main: p['500'].color,
    dark: p['900'].color,
    light: p['300'].color,
    cats: [
        p['500'].color, p['500'].color, p['500'].color, p['500'].color, p['500'].color,
        p['500'].color, p['500'].color, p['500'].color, p['500'].color, p['500'].color,
        p['500'].color, p['400'].color, p['400'].color, p['400'].color, p['400'].color,
        p['400'].color, p['300'].color, p['300'].color, p['300'].color, p['200'].color,
    ],
    sizes: [24, 24 * 1.618, 24 * 1.618 * 1.618],
    maxSize: 24 * 1.618 * 1.618,
})

const THEMES = [
    createTheme(4, palette.DeepPurple, palette.Purple),
    createTheme(3, palette.Purple, palette.DeepPurple),
    createTheme(2, palette.Pink, palette.Pink),
    createTheme(1, palette.Red, palette.Yellow),
    createTheme(5, palette.Indigo, palette.Pink),
    createTheme(6, palette.Blue, palette.Cyan),
    createTheme(7, palette.LightBlue, palette.Cyan),
    createTheme(8, palette.DeepOrange, palette.Yellow),
    createTheme(9, palette.Orange, palette.Yellow),
    createTheme(10, palette.Amber, palette.Yellow),
    createTheme(11, palette.Yellow, palette.Yellow),
    createTheme(12, palette.LightGreen, palette.Green),
    createTheme(13, palette.Green, palette.Green),
    createTheme(14, palette.Brown, palette.Brown),
    createTheme(15, palette.BlueGrey, palette.Brown),
]

const SETS = ['1', '2', '3', '4', '5', '6', undefined, undefined]

class WallpaperGenerator extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            refreshing: false,
            fabVisible: true,
            wallpaperItems: [],
            theme: THEMES[0],

            themeChangeCount: 0,
            themeLimitReached: false,
        }

        this.tracker = new GoogleAnalyticsTracker("UA-100789786-1");
    }

    async componentWillMount() {

    }

    async componentDidMount() {

        this.tracker.trackScreenView(ANALYTICS_PAGE_NAME)

        if (__DEV__) {
            console.log('WallpaperGenerator:doShowAds - DEV MODE!!!')
            Alert.showLongText('Showing ads on dev mode!')
            await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
        } else {
            console.log('WallpaperGenerator:doShowAds - PROD MODE!!!')
            // Alert.showLongText('Showing ads on prod mode!')
            await AdMobRewarded.setAdUnitID('ca-app-pub-5594222713152935/1022883731');
        }

        this.doUpdateTheme()
    }

    async componentWillUnmount() {
    }

    asyncSetState = async state => new Promise(a =>
        this.setState({ ...this.state, ...state }, a)
    )

    doChangeRefreshing = refreshing => (
        this.asyncSetState({ refreshing })
    )

    doUpdateTheme = async (_theme) => {

        if (this.state.refreshing)
            return

        this.tracker.trackEvent(ANALYTICS_EVENT_CATEGORY, ANALYTICS_EVENT_GENERATE_NEW_WALLPAPER)

        await this.doChangeRefreshing(true)
        const theme = _theme || this.state.theme

        await this.asyncSetState({ theme })

        setTimeout(async () => {

            const tileSize = theme.maxSize * 1
            const windowSize = {
                width: Dimensions.get('window').width + 32 * 2,
                height: Dimensions.get('window').height + 192 * 2
            }
            const wCount = parseInt(windowSize.width / tileSize) + 3
            const hCount = parseInt(windowSize.height / tileSize) + 3
            const wallpaperItems = []

            let key = 0
            let flag = false
            const set = SETS[parseInt(Math.random() * SETS.length)]
            for (let x = -wCount / 2; x < wCount / 2; x++) {

                flag = !flag
                for (let y = -hCount / 2; y < hCount / 2; y++) {

                    wallpaperItems.push(
                        <CatIcon
                            key={key++}
                            set={set}
                            size={theme.sizes[parseInt(Math.random() * theme.sizes.length)]}
                            color={theme.cats[parseInt(Math.random() * theme.cats.length)]}
                            style={{
                                position: 'absolute',
                                left: x * tileSize - tileSize / 2 + windowSize.width / 2,
                                top: y * tileSize - tileSize / 2 + (flag ? 0 : tileSize / 2) + windowSize.height / 2,
                                width: tileSize,
                                height: tileSize,
                            }} />
                    )
                }
            }

            await this.asyncSetState({
                wallpaperItems,
                theme,
                themeChangeCount: this.state.themeChangeCount + 1,
                refreshing: false
            })

            setTimeout(async () => {

                try {

                    if (this.state.themeChangeCount >= MAX_THEME_CHANGE_BEFORE_ADS) {
                        console.log('WallpaperGenerator:doUpdateTheme - Checking for ads...')

                        await AdMobRewarded.requestAd()
                        console.log('WallpaperGenerator:doUpdateTheme - Ad found!')
                        this.asyncSetState({
                            themeLimitReached: true,
                        })

                    } else {

                        this.asyncSetState({
                            themeLimitReached: false,
                        })

                    }

                } catch (error) {

                    if (error.message.startsWith('Ad is already loaded')) {
                        console.log('WallpaperGenerator:doUpdateTheme - Ad is already loaded!')
                        this.asyncSetState({
                            themeLimitReached: true,
                        })
                    } else {
                        console.log('WallpaperGenerator:doUpdateTheme - No ads found:', error.message)
                        this.asyncSetState({
                            themeLimitReached: false,
                        })
                    }

                }

            }, 200)
        }, 200)

    }

    doSetWallpaper = async () => {
        if (this.state.refreshing)
            return

        this.tracker.trackEvent(ANALYTICS_EVENT_CATEGORY, ANALYTICS_EVENT_CHANGE_WALLPAPER)

        setTimeout(async () => {
            try {

                if (this.refs.wallpaperRef) {
                    const path = await this.refs.wallpaperRef.capture()
                    this.doChangeRefreshing(true)

                    const clearPath = path.replace('file://', '')
                    await WallpaperManager.setWallpaper({ path: clearPath })
                    await releaseCapture(path)
                    Alert.showLongText(this.props.t('wallpaper-set-success-message'))
                }

            } catch (error) {
                console.log("WallpaperGenerator:componentDidMount - Can't generate wallpaper:", error)
                Alert.showLongText(this.props.t('wallpaper-set-error-message'))
            }

            this.doChangeRefreshing(false)
        }, 200)
    }

    doShowAds = async () => {
        setTimeout(async () => {

            this.doChangeRefreshing(true)

            try {

                try {
                    await AdMobRewarded.requestAd()
                } catch (error) {
                    /** ... */
                }

                this.tracker.trackEvent(ANALYTICS_EVENT_CATEGORY, ANALYTICS_EVENT_SEE_ADS)

                await AdMobRewarded.showAd()

                AdMobRewarded.removeAllListeners()
                AdMobRewarded.addEventListener('rewarded', (reward) => {
                    console.log('WallpaperGenerator:doShowAds - Ad rewarded:', reward)
                    // Alert.showLongText(this.props.t('watch-thanks'))
                    this.asyncSetState({ themeChangeCount: 0, themeLimitReached: false })
                });

            } catch (error) {

                console.log('WallpaperGenerator:doShowAds - Can\'t show Ad:', error)
                this.asyncSetState({ themeChangeCount: 0, themeLimitReached: false })

            }

            this.asyncSetState({ refreshing: false })

        }, 200)
    }

    render() {

        const { t, theme, styles } = this.props
        const { refreshing, wallpaperItems, theme: wTheme, themeLimitReached } = this.state

        return (
            <Page>
                <Box column fit>
                    <Box style={styles.backHeader} ref="backHeader" />

                    <Box centralize
                        style={{ height: 56, marginTop: 8 }}>
                        <Text style={{
                            fontWeight: '500',
                            fontSize: 24,
                            color: wTheme.dark,
                            marginRight: 8,
                        }}>{t('wallpaper-generator-screen-title')}</Text>
                        <CatIcon set={'3'}
                            size={36}
                            rotation={30}
                            color={wTheme.dark} />
                    </Box>

                    <Box alignItems="stretch" fit column>
                        <Box padding fit>
                            <Paper fit style={styles.wallpaperPaperWrapper}>
                                {
                                    refreshing ?
                                        (
                                            <Box centralize fitAbsolute>
                                                <ActivityIndicator color={theme.palette.Primary.color} />
                                            </Box>
                                        ) : (
                                            <ViewShot ref="wallpaperRef"
                                                options={{ format: "png" }}
                                                style={{ flex: 1 }}>

                                                <Box style={[
                                                    styles.wallpaperRoot,
                                                    {
                                                        backgroundColor: wTheme.background
                                                    }
                                                ]}>
                                                    {wallpaperItems}
                                                </Box>

                                            </ViewShot>
                                        )
                                }

                                <Fab color={wTheme.dark}
                                    onPress={() => themeLimitReached ? this.doShowAds() : this.doUpdateTheme()}
                                    icon={themeLimitReached ? 'play' : 'reload'}
                                    style={styles.fab1}
                                    animated={themeLimitReached}
                                    animatedText={t('watch-video')}
                                />

                                {
                                    !themeLimitReached && (
                                        <Fab color={wTheme.dark}
                                            onPress={() => this.doSetWallpaper()}
                                            icon={'check'}
                                            style={styles.fab2}
                                            animated={false}
                                        />
                                    )
                                }

                            </Paper>
                        </Box>

                        <Box style={styles.colorsBoxWrapper}
                            pointerEvents={themeLimitReached ? 'none' : 'auto'}>
                            <ScrollView horizontal>
                                <Paper style={styles.colorsBox} column={false}>
                                    {THEMES.map(th => (
                                        <Fab color={th.background}
                                            key={th.id}
                                            onPress={() => this.doUpdateTheme(th)}
                                            icon={wTheme.id === th.id ? 'check' : ''}
                                            style={styles.colorFab}
                                            animated={false}
                                        />
                                    ))}
                                </Paper>
                            </ScrollView>
                            {
                                themeLimitReached && (
                                    <Box fitAbsolute style={styles.limitOverlay} />
                                )
                            }
                        </Box>
                    </Box>
                </Box>
            </Page>
        )
    }
}

const styles = (theme) => StyleSheet.create({
    backHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        // backgroundColor: 'white'
        // backgroundColor: theme.palette.Primary['500'].color
    },
    fab1: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        zIndex: 1000
    },
    fab2: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        zIndex: 1000
    },
    colorFab: {
    },
    colorsBoxWrapper: {
        height: 56 + 16 + 8 + 8,
        paddingBottom: 8
    },
    colorsBox: {
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        height: 56 + 16,
    },
    wallpaperPaperWrapper: {
        borderRadius: 8,
        overflow: 'hidden'
    },
    wallpaperRoot: {
        position: 'absolute',
        left: -32,
        right: -32,
        top: -192,
        bottom: -192,
        backgroundColor: theme.palette.White['500'].color
    },
    wallpaperText: {
        fontFamily: 'CatIcons'
    },
    limitOverlay: {
        backgroundColor: 'rgba(255, 255, 255, .8)'
    }
})

export default translate('common')(withTheme(styles, WallpaperGenerator))