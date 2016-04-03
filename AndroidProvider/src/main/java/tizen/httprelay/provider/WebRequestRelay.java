package tizen.httprelay.provider;


import android.annotation.TargetApi;
import android.os.Build;
import android.util.Log;

import java.io.*;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;

public class WebRequestRelay {

    public byte[] httpRequest(byte[] data) throws InvalidRequestException {
        try {
            ByteArrayInputStream in = new ByteArrayInputStream(data);
            String address = readLine(in);
            String port = readLine(in);
            return httpRequest(InetAddress.getByName(address), Integer.valueOf(port), in);
        } catch (NumberFormatException|UnknownHostException e) {
            throw new InvalidRequestException(e);
        }
    }

    private String readLine(ByteArrayInputStream in) {
        StringBuilder val = new StringBuilder();
        int c;
        while ((c = in.read()) != '\n') {
            val.append((char) c);
        }
        return val.toString();
    }

    @TargetApi(Build.VERSION_CODES.KITKAT)
    private byte[] httpRequest(InetAddress address, int port, ByteArrayInputStream in) throws InvalidRequestException {

        try (Socket s = new Socket(address, port)) {
            DataOutputStream out = new DataOutputStream(s.getOutputStream());

            int n = in.available();
            byte[] bytes = new byte[n];
            in.read(bytes, 0, n);

            out.write(bytes);
            out.flush();
            InputStream is = s.getInputStream();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int readBytes;
            while ((readBytes = is.read(buffer)) > 1) {
                baos.write(buffer, 0, readBytes);
            }

            return baos.toByteArray();


        } catch (IOException e) {
            Log.e(WebRequestRelay.class.getSimpleName(), "Request sending failed", e);
            throw new InvalidRequestException(e);
        }

    }
}