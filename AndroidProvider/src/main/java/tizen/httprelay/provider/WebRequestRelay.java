package tizen.httprelay.provider;


import android.annotation.TargetApi;
import android.os.Build;
import android.util.Log;
import com.android.volley.*;
import com.android.volley.toolbox.StringRequest;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.net.InetAddress;
import java.net.Socket;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class WebRequestRelay {


    private final RequestQueue queue;


    public WebRequestRelay(RequestQueue queue) {
        this.queue = queue;
    }

    public void jsonRequest(JSONObject request, VolleyCallback callback) throws InvalidRequestException {
        try {
            String method = request.getString("method");
            String url = request.getString("url");
            if (request.has("headers")) {
                // ... TODO
            }
            httpRequest(url, Collections.EMPTY_MAP,callback);
        } catch (JSONException e) {
            Log.e(HttpProviderService.TAG, "Invalid request", e);
            throw new InvalidRequestException(e);
        }
    }
    public void httpRequest(String url, Map<String, String> headers, VolleyCallback callback) throws InvalidRequestException {
        try {
            /*
            String req = new String(data);
            Log.i(HttpProviderService.TAG, "Received data len " + data.length);
            Log.i(HttpProviderService.TAG, req);
            ByteArrayInputStream in = new ByteArrayInputStream(data);
            String address = readLine(in);
            String port = readLine(in);

            Map<String, String> requestHeaders = parseHTTPHeaders(in, new ByteArrayOutputStream());
            */
            requestWithSomeHttpHeaders(url, headers, callback);

            //return httpRequest(InetAddress.getByName(address), Integer.valueOf(port), in);
        } catch (InterruptedException e) {
            Log.e(HttpProviderService.TAG, "Interrupted", e);
            throw new InvalidRequestException(e);
        } catch (ExecutionException e) {
            Log.e(HttpProviderService.TAG, "Execution failure", e);
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
            Map<String, String> headers = parseHTTPHeaders(is, baos);
            int total = 1024;
            if (headers.containsKey("Content-Length")) {
                total = Integer.parseInt(headers.get("Content-Length"));
            }

            byte[] buffer = new byte[total];
            int readBytes;
            while ((readBytes = is.read(buffer, 0, total)) > 1) {
                baos.write(buffer, 0, readBytes);
                if (readBytes == total) {
                    break;
                }
            }
            byte[] ans = baos.toByteArray();
            Log.d(HttpProviderService.TAG, "received response");

            Log.d(HttpProviderService.TAG, new String(ans));

            return ans;
        } catch (IOException e) {
            Log.e(HttpProviderService.TAG, "Request sending failed", e);
            throw new InvalidRequestException(e);
        }
    }

    public static Map<String, String> parseHTTPHeaders(InputStream inputStream, ByteArrayOutputStream baos)
            throws IOException {
        int charRead;
        StringBuffer sb = new StringBuffer();
        while (true) {
            sb.append((char) (charRead = inputStream.read()));
            if ((char) charRead == '\r') {            // if we've got a '\r'
                sb.append((char) inputStream.read()); // then write '\n'
                charRead = inputStream.read();        // read the next char;
                if (charRead == '\r') {                  // if it's another '\r'
                    sb.append((char) inputStream.read());// write the '\n'
                    break;
                } else {
                    sb.append((char) charRead);
                }
            }
        }
        baos.write(sb.toString().getBytes());
        baos.write("\r\n".getBytes());
        String[] headersArray = sb.toString().split("\r\n");
        Map<String, String> headers = new HashMap<>();
        for (int i = 1; i < headersArray.length - 1; i++) {
            headers.put(headersArray[i].split(": ")[0],
                    headersArray[i].split(": ")[1]);
        }

        return headers;
    }


    public void requestWithSomeHttpHeaders(String url, final Map<String, String> headers, final VolleyCallback callback) throws ExecutionException, InterruptedException {
        // TODO POST

        StringRequest postRequest = new StringRequest(Request.Method.GET, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                JSONObject ans = new JSONObject();
                try {
                    ans.put("response", response);
                } catch (JSONException e) {
                    Log.e(HttpProviderService.TAG, "Error generating response", e);
                }
                callback.onSuccess(ans);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                callback.onError(error.toString());
            }
        }) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                return headers;
            }

            @Override
            public byte[] getBody() {
                return null;
            }
        };
        queue.add(postRequest);

    }

}