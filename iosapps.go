package main

import (
	"context"
	"fmt"
	"os"
	"unsafe"

	"github.com/luc-git/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"
	"github.com/luc-git/go-ios/ios/house_arrest"
	"github.com/luc-git/go-ios/ios/installationproxy"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var housearrestconnection *afc.Connection

func Newiosapp(idevice ios.DeviceEntry, ctx context.Context) {
	completepath := []string{}
	runtime.EventsOn(ctx, "connecttoapp", func(optionalData ...interface{}) {
		completepath = nil
		completepath = append(completepath, "Documents/")
		if housearrestconnection == nil {
			newHouseArrest(idevice, ctx, completepath, optionalData...)
		} else {
			housearrestClose()
			newHouseArrest(idevice, ctx, completepath, optionalData...)
		}
	})
	runtime.EventsOn(ctx, "getappsfiles", func(optionalData ...interface{}) {
		completepath = completePathEdit(completepath, optionalData[0].(string))
		if len(completepath) == 0 {
			runtime.EventsEmit(ctx, "getapps")
			return
		}
		getFiles(housearrestconnection, ctx, completepath, true)
	})
}

func getapps(sharingapps []installationproxy.AppInfo, ctx context.Context) {
	for _, sharing := range sharingapps {
		if sharing.UIFileSharingEnabled {
			runtime.EventsEmit(ctx, "appslist", sharing.CFBundleName, sharing.CFBundleIdentifier)
		}
	}
}

func loadappDir(idevice ios.DeviceEntry, sharingapps []installationproxy.AppInfo) {
	const filesharingpath = "images/filesharingapps"
	devicecon, _ := New(idevice)
	for _, sharing := range sharingapps {
		if sharing.UIFileSharingEnabled {
			os.MkdirAll(filesharingpath, os.ModeDir)
			devicecon.GetIconData(filesharingpath, sharing.CFBundleIdentifier)
		}
	}
	devicecon.deviceConn.Close()
}

func newHouseArrest(idevice ios.DeviceEntry, ctx context.Context, completepath []string, appid ...interface{}) {

	connection, err := house_arrest.New(idevice, appid[0].(string))
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	housearrestconnection = (*afc.Connection)(unsafe.Pointer(connection))
	getFiles(housearrestconnection, ctx, completepath, true)
}

func housearrestClose() {
	if housearrestconnection != nil {
		housearrestconnection.Close()
	}
}
