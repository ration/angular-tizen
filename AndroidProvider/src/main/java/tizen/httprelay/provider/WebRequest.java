package tizen.httprelay.provider;

import android.util.Log;
import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.HttpHeaderParser;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.Map;

class WebRequest extends Request<JSONObject> {

    private final Map<String, String> headers;
    private Map<String, String> params;
    private final Response.Listener<JSONObject> mListener;

    public WebRequest(Map<String, String> headers, Map<String, String> params, int method, String url, Response.Listener<JSONObject> listener, Response.ErrorListener errorListener) {
        super(method, url, errorListener);
        this.headers = headers;
        this.params = params;
        mListener = listener;

    }

    @Override
    public Map<String, String> getHeaders() throws AuthFailureError {
        if (!headers.isEmpty()) {
            return headers;
        }
        return super.getHeaders();
    }


    @Override
    protected Map<String, String> getParams() throws AuthFailureError {
        if (!params.isEmpty()) {
            return params;
        }
        return super.getParams();
    }

    @Override
    protected Response<JSONObject> parseNetworkResponse(NetworkResponse response) {
        String parsed;
        try {
            parsed = new String(response.data, HttpHeaderParser.parseCharset(response.headers));
        } catch (UnsupportedEncodingException e) {
            parsed = new String(response.data);
        }
        JSONObject ans = new JSONObject();
        try {
            ans.put("response", parsed);
            ans.put("code", response.statusCode);
            ans.put("headers", response.headers);
            return Response.success(ans, HttpHeaderParser.parseCacheHeaders(response));
        } catch (JSONException e) {
            Log.e(HttpProviderService.TAG, "Error generating response", e);
        }

        return Response.error(new VolleyError("Request failed to parse"));
    }

    @Override
    protected void deliverResponse(JSONObject response) {
        {
            mListener.onResponse(response);
        }

    }

}
