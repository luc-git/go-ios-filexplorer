package main

import (
	"fmt"
	"os"
	"path"

	"github.com/luc-git/go-ios/ios"
)

const serviceName = "com.apple.springboardservices"

type Connection struct {
	deviceConn ios.DeviceConnectionInterface
	plistCodec ios.PlistCodec
}

func New(device ios.DeviceEntry) (*Connection, error) {
	deviceConn, err := ios.ConnectToService(device, serviceName)
	if err != nil {
		return nil, err
	}
	return &Connection{deviceConn: deviceConn, plistCodec: ios.NewPlistCodec()}, nil

}

func (conn *Connection) GetIconData(filesharingpath string, bundleId string, BundleName string) error {
	reader := conn.deviceConn.Reader()
	getIconPNGData := map[string]interface{}{"command": "getIconPNGData", "bundleId": bundleId}
	msg, err := conn.plistCodec.Encode(getIconPNGData)
	if err != nil {
		return fmt.Errorf("getIconPNGData Encoding cannot fail unless the encoder is broken: %v", err)
	}
	fmt.Print(getIconPNGData)
	err = conn.deviceConn.Send(msg)
	if err != nil {
		return err
	}
	response, err := conn.plistCodec.Decode(reader)
	if err != nil {
		return err
	}
	plist, err := ios.ParsePlist(response)
	if err != nil {
		return err
	}
	status, ok := plist["pngData"]
	if !ok {
		return fmt.Errorf("unexpected response: %+v", plist)
	}
	fmt.Printf(bundleId + "\n")
	os.WriteFile(path.Join(filesharingpath, BundleName+".png"), status.([]byte), 0777)
	return nil
}
