package com.ble_sovellus;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnziparchive.RNZipArchivePackage;
import com.remobile.toast.RCTToastPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rnfs.RNFSPackage;
import io.realm.react.RealmReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import it.innove.BleManagerPackage;
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
            new RNZipArchivePackage(),
            new RCTToastPackage(),
            new BackgroundTimerPackage(),
            new RNDeviceInfo(),
            new RNFSPackage(),
            new RealmReactPackage(),
            new VectorIconsPackage(),
            new BleManagerPackage()
      );
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
