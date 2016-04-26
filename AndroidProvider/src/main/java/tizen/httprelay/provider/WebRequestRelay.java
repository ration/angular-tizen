package tizen.httprelay.provider;


import android.util.Log;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.util.Collections;
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
            httpRequest(url, Collections.EMPTY_MAP, Collections.EMPTY_MAP, callback);
        } catch (JSONException e) {
            Log.e(HttpProviderService.TAG, "Invalid request", e);
            throw new InvalidRequestException(e);
        }
    }

    public void httpRequest(String url, Map<String, String> headers, Map<String, String> params, VolleyCallback callback) throws InvalidRequestException {
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
            requestWithSomeHttpHeaders(Request.Method.GET, url, headers, params, callback);

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

    public void requestWithSomeHttpHeaders(int method, String url,
                                           final Map<String, String> headers,
                                           final Map<String, String> params,
                                           final VolleyCallback callback) throws ExecutionException, InterruptedException {


        WebRequest postRequest = new WebRequest(headers, params, method, url, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {

                callback.onSuccess(response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {

                JSONObject ans = new JSONObject();
                try {
                    ans.put("response", error.getMessage());
                    ans.put("code", error.networkResponse.statusCode);
                } catch (JSONException e) {
                    Log.e(HttpProviderService.TAG, "Error generating response", e);
                }
                callback.onError(ans);
            }
        });

        queue.add(postRequest);

    }


}