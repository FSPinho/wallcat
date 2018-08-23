package com.cytech.wallcat;

import android.app.Application;

import com.cytech.wallcat.wallpaper.WallpaperManagerPackage;
import com.facebook.react.ReactApplication;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;

import fr.greweb.reactnativeviewshot.RNViewShotPackage;

import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.sbugert.rnadmob.RNAdMobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNLanguagesPackage(),
                    new RNViewShotPackage(),
                    new GoogleAnalyticsBridgePackage(),
                    new RNAdMobPackage(),
                    new VectorIconsPackage(),
                    new WallpaperManagerPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
