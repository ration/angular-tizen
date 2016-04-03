package tizen.httprelay.provider;

import com.samsung.android.sdk.SsdkInterface;
import com.samsung.android.sdk.accessory.SAAgent;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.robolectric.RobolectricGradleTestRunner;
import org.robolectric.annotation.Config;

@RunWith(RobolectricGradleTestRunner.class)
@Config(constants = BuildConfig.class)
public class HttpProviderServiceTest {

    @Mock
    SsdkInterface ssdkInterface;

    @Test
    public void respondServiceConnection() {
       HttpProviderService service = new HttpProviderService();
        service.onCreate();
   //     HttpProviderService.ServiceConnection connectionHandler = service.getConnectionHandler();
        //       service.

//        service.onServiceConnectionResponse(null,socket, SAAgent.CONNECTION_SUCCESS);


    }

}
