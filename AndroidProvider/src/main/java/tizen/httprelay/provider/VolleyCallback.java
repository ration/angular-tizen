package tizen.httprelay.provider;

import org.json.JSONObject;

public interface VolleyCallback  {
    void onSuccess(JSONObject object);

    void onError(JSONObject errors);
}
