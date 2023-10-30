package main

import (
	"context"
	"fmt"
	"unsafe"

	"github.com/luc-git/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"
	"github.com/luc-git/go-ios/ios/house_arrest"
	"github.com/luc-git/go-ios/ios/installationproxy"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func getapps(sharingapps []installationproxy.AppInfo, ctx context.Context) {
	runtime.EventsEmit(ctx, "clearpage")
	for _, sharing := range sharingapps {
		if sharing.UIFileSharingEnabled {
			runtime.EventsEmit(ctx, "pathlist", sharing.CFBundleName, Iosapp, sharing.CFBundleIdentifier)
		}
	}
}

func loadappDir(idevice ios.DeviceEntry, sharingapps []installationproxy.AppInfo) {
	const filesharingpath = "images/filesharingapps"
	devicecon, _ := New(idevice)
	for _, sharing := range sharingapps {
		if sharing.UIFileSharingEnabled {
			devicecon.GetIconData(filesharingpath, sharing.CFBundleIdentifier, sharing.CFBundleName)
		}
	}
	devicecon.deviceConn.Close()
}

func newHouseArrest(idevice ios.DeviceEntry, ctx context.Context, completepath []string, appid ...interface{}) *afc.Connection {

	connection, err := house_arrest.New(idevice, appid[0].(string))
	if err != nil {
		fmt.Printf(err.Error())
		return nil
	}
	housearrestconnection := (*afc.Connection)(unsafe.Pointer(connection))
	getFiles(housearrestconnection, ctx, completepath)
	return housearrestconnection
}

func housearrestClose() {
	if housearrestconnection != nil {
		housearrestconnection.Close()
	}
}
