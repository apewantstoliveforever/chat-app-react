import { axiosPrivate } from "../api/axios"
import { useEffect,  useContext } from "react"
import useRefreshToken from "./useRefreshToken"
import authContext from "../context/authContext"



const useAxiosPrivate = () => {
    const refresh = useRefreshToken()
    const { authenticated } = useContext(authContext)

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use (
            config => {
                if (!config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${authenticated}`
                }
                return configg
            }, (error) => Promise.reject(error)
        )
        
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true
                    const newAccessToken = await refresh()
                    prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
                    return axiosPrivate(prevRequest)
                }
                return Promise.reject(error)
            }
        )
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept)
            axiosPrivate.interceptors.response.eject(responseIntercept)
        }
    }, [authenticated, refresh])
    return axiosPrivate
}
export default useAxiosPrivate
