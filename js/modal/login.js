axiosInstance.interceptors.response.use(
    async (response) => {
        // 만약 백엔드가 JWT 만료 시에도 200 OK를 주고, body에 특정 메시지를 내려줄 경우
        if (response.data?.message === 'Expired JWT Token') {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/';
                return Promise.reject(new Error('No refresh token'));
            }

            try {
                const res = await axios.post('/members/reissue', { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

                setTokens(newAccessToken, newRefreshToken);

                // 재요청
                const originalRequest = response.config;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                clearTokens();
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/';
                return Promise.reject(err);
            }
        }

        return response;
    },
    async (error) => {
        // 기존 401 처리
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post('/members/reissue', { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                setTokens(newAccessToken, newRefreshToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);
            } catch (reissueError) {
                clearTokens();
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/';
                return Promise.reject(reissueError);
            }
        }

        return Promise.reject(error);
    }
);
