package tizen.httprelay.provider;


import android.util.Log;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class WebRequestRelay {

    private final RequestQueue queue;

    public WebRequestRelay(RequestQueue queue) {
        this.queue = queue;
    }

    public void jsonRequest(JSONObject request, VolleyCallback callback) throws InvalidRequestException {
        try {
            int method = methodFromString(request.getString("method"));

            String url = request.getString("url");
            Map<String, String> headers = new HashMap<>();
            if (request.has("headers")) {
                JSONObject headerJson = request.getJSONObject("headers");
                Iterator<?> keys = headerJson.keys();

                while (keys.hasNext()) {
                    String key = (String) keys.next();
                    headers.put(key, headerJson.getString(key));
                }

            }
            String data = null;
            if (request.has("data")) {
                data = request.getString("data");
            }

            httpRequest(method, url, headers, data, callback);
        } catch (JSONException e) {
            Log.e(HttpProviderService.TAG, "Invalid request", e);
            throw new InvalidRequestException(e);
        }
    }

    public void httpRequest(int Method, String url, Map<String, String> headers, String data, VolleyCallback callback) throws InvalidRequestException {
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
            requestWithSomeHttpHeaders(Method, url, headers, data, callback);

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

    public void requestWithSomeHttpHeaders(int Method, String url,
                                           final Map<String, String> headers,
                                           final String data,
                                           final VolleyCallback callback) throws ExecutionException, InterruptedException {


        WebRequest postRequest = new WebRequest(headers, data, Method, url, new Response.Listener<JSONObject>() {
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

    public static int methodFromString(String Method) {
        if (Method.equals("DEPRECATED_GET_OR_POST")) {
            return Request.Method.DEPRECATED_GET_OR_POST;
        }
        if (Method.equals("GET")) {
            return Request.Method.DEPRECATED_GET_OR_POST;
        }

        if (Method.equals("POST")) {
            return Request.Method.POST;
        }

        if (Method.equals("PUT")) {
            return Request.Method.PUT;
        }

        if (Method.equals("DELETE")) {
            return Request.Method.DELETE;
        }

        if (Method.equals("HEAD")) {
            return Request.Method.HEAD;
        }

        if (Method.equals("OPTIONS")) {
            return Request.Method.OPTIONS;
        }

        if (Method.equals("TRACE")) {
            return Request.Method.TRACE;
        }

        if (Method.equals("PATCH")) {
            return Request.Method.PATCH;
        }
        return Request.Method.DEPRECATED_GET_OR_POST;
    }


}