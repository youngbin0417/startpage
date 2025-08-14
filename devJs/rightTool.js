var $rightTool = {
	
    /**
     * 초기화
     */
    init : function() {
		$rightTool.value.ps = new kakao.maps.services.Places(map);
		
		// 그려지고 있는 다각형을 표시할 다각형을 생성하고 지도에 표시합니다
        $rightTool.value.square.drawingPolygon = new kakao.maps.Polygon({
            map: map, // 다각형을 표시할 지도입니다
            strokeWeight: 3, // 선의 두께입니다 
            strokeColor: '#00a0e9', // 선의 색깔입니다
            strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid', // 선의 스타일입니다
            fillColor: '#00a0e9', // 채우기 색깔입니다
            fillOpacity: 0.2 // 채우기 불투명도입니다
        }); 
        
        $rightTool.value.mapType = kakao.maps.MapTypeId.ROADMAP;
    },
    
    value : {
		searchIdx : 0,
		src : "",
		placeOverlays : [], 
	    markers : [], // 마커를 담을 배열입니다
	    currCategory : '', // 현재 선택된 카테고리를 가지고 있을 변수입니다
	    ps : null,
		mapType : null,
	    pageIdx : 0,
	    
	    rebuildList : [],
	    
		distance : {
			drawingFlag : false, // 선이 그려지고 있는 상태를 가지고 있을 변수입니다
			moveLine : null, // 선이 그려지고 있을때 마우스 움직임에 따라 그려질 선 객체 입니다
			clickLine : null,
			distanceOverlay : null, // 선의 거리정보를 표시할 커스텀오버레이 입니다
			dots : {} // 선이 그려지고 있을때 클릭할 때마다 클릭 지점과 거리를 표시하는 커스텀 오버레이 배열입니다.
		},
		
		square : {
			drawingFlag : false, // 다각형이 그려지고 있는 상태를 가지고 있을 변수입니다
			drawingPolygon : null, // 그려지고 있는 다각형을 표시할 다각형 객체입니다
			polygon : null, // 그리기가 종료됐을 때 지도에 표시할 다각형 객체입니다
			areaOverlay : null // 다각형의 면적정보를 표시할 커스텀오버레이 입니다
		},
	},
	
	/**
	 * 내 위치 가져오기 객체
	 */
	location : {
		/**
		 * 현재위치 가져와서 이동시키기
		 */
		fnGetLocationLoad : function() {
			navigator.geolocation.getCurrentPosition($rightTool.location.fnLocationLoadSuccess,$rightTool.location.fnLocationLoadError);
		},
		
		/**
		 * 위치 가져오기 성공
		 */
		fnLocationLoadSuccess : function(pos) {
			// 현재 위치 받아오기
		    let currentPos = new kakao.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
		    
		    let latlng = map.getCenter(); 
		    let message = '변경된 지도 중심좌표는 ' + latlng.getLat() + ' 이고, ';
		    message += '경도는 ' + latlng.getLng() + ' 입니다';
		    
		    $mainFunction.value.lat = latlng.getLat();
		    $mainFunction.value.lng = latlng.getLng();
		    
		    // 주소정보 가져오기
		    $mainFunction.fnSearchDetailAddrFromCoords(latlng, function(result, status) {
		        if (status === kakao.maps.services.Status.OK) {
		            $mainFunction.value.addr = result[0].address.address_name;
		        }   
		    });
		
		    // 지도 이동(기존 위치와 가깝다면 부드럽게 이동)
		    map.panTo(currentPos);
		},
		
		/**
		 * 위치 가져오기 실패
		 */
		fnLocationLoadError : function() {
			$toast.error('위치 정보를 가져오는데 실패했습니다.');
		}
	},
	
	/**
	 * 지도레벨 변경
	 */
	mapLevel : {
		// 지도확대
		fnZoomIn : function() {        
			let level = map.getLevel();
			
		    // 지도를 1레벨 내립니다 (지도가 확대됩니다)
		    map.setLevel(level - 1);
		},
	
		// 지도축소
		fnZoomOut : function() {    
			let level = map.getLevel();
			
		    // 지도를 1레벨 올립니다 (지도가 축소됩니다)
		    map.setLevel(level + 1);
		},
	},
	
	/**
	 * 맵 아이콘 표시 
	 * 1:아파트
	 * 2:오피스텔
	 * 3:연립/다세대
	 * 4:단독/다가구
	 * 5:상업용 빌딩
	 * 6:공장
	 * 7:지하철
	 * 8:버스
	 * 9:병원
	 * 10:마트
	 * 11:카페
	 * 12:유치원
	 * 13:초등학교
	 * 14:중학교
	 * 15:고등학교
	 * 16:재건축
	 * 17:재개발
	 * 18:리모델링
	 */
	ico : {
		/**
		 *  지도아이콘 클릭
		 */
		fnIcoClick : function(idx, thiz){
			if($("#ico"+idx).hasClass("active")){
				$("#ico"+idx).removeClass("active");
				
				$rightTool.value.searchIdx = 0;
				$rightTool.value.src = "";
				$commonMap.fnRemoveAllObj();
				
				return false;
			} else {
				$('div[name="ico"]').removeClass('active');
				
				$("#ico"+idx).addClass("active");
				
				//지도이동시 갱신해줄 전역변수 추가
				$rightTool.value.searchIdx = idx;
				$rightTool.value.src = $(thiz).attr("src");
				
				$rightTool.ico.fnIcoOnLoad(idx);
			}
		},
		
		/**
		 * 지도 아이콘 표시 로직
		 */
		fnIcoOnLoad : function(idx){
			$commonMap.fnRemoveAllObj();
			$rightTool.value.pageIdx = 0;
			
			if(idx == 7 || idx == 9 || idx == 10){
				if(idx == 7){
					$rightTool.value.currCategory = "SW8";
				} else if(idx == 9){
					$rightTool.value.currCategory = "HP8";
				} else if(idx == 10){
					$rightTool.value.currCategory = "MT1";
				}
		        $rightTool.ico.fnSearchPlaces(idx);
			} else {
				// 지도의 현재 영역을 얻어옵니다 
	    		let bounds = map.getBounds();
	    		
			    // 영역의 남서쪽 좌표를 얻어옵니다 
			    let swLatLng = bounds.getSouthWest(); 
			    
			    // 영역의 북동쪽 좌표를 얻어옵니다 
			    let neLatLng = bounds.getNorthEast(); 
				
				let maX = swLatLng.getLat();
				let laX = swLatLng.getLng();
				let maY = neLatLng.getLat();
				let laY = neLatLng.getLng();
				
				$eventBus.emit('loadingOn');
				$.ajax({
					type : "post",
					dataType : "json",
					data : {
						"idx":idx,
						"addr":$mainFunction.value.addr,
						"laX":laX,
						"maX":maX,
						"laY":laY,
						"maY":maY
					},
					cache : false,
					url : "/rightTool/getIco",
					beforeSend : function(xhr) {
					},
					success : function(rtn) {
						if(rtn.result == 1){
							if(idx == 1 || idx == 2 || idx == 4){
								for (let i=0; i<rtn.list.length; i++) {
					            	$rightTool.ico.fnAddMarker(new kakao.maps.LatLng(rtn.list[i].latitude, rtn.list[i].longitude), i);
							    }
							} else if(idx == 3){
								if($mainFunction.value.level == 4){
									for (let i=0; i<rtn.list.length; i+=5) {
						            	$rightTool.ico.fnAddMarker(new kakao.maps.LatLng(rtn.list[i].latitude, rtn.list[i].longitude), i);
								    }
								} else {
									for (let i=0; i<rtn.list.length; i++) {
						            	$rightTool.ico.fnAddMarker(new kakao.maps.LatLng(rtn.list[i].latitude, rtn.list[i].longitude), i);
								    }
								}
							} else if(idx == 8 || idx == 11 || idx == 13 || idx == 14 || idx == 15){
								for (let i=0; i<rtn.list.length; i++) {
					            	$rightTool.ico.fnAddMarker(new kakao.maps.LatLng(rtn.list[i].latitude, rtn.list[i].longitude), i);
					                $rightTool.ico.fnDisplayPlaceInfo(rtn.list[i], i);
							    }
							} else if(idx == 16 || idx == 17 || idx == 18){
								$rightTool.value.rebuildList = [];
								$rightTool.value.rebuildList = rtn.list;

								for (let i=0; i<rtn.list.length; i++) {
					            	$rightTool.ico.fnAddMarker(new kakao.maps.LatLng(rtn.list[i].stdLatitude, rtn.list[i].stdLongitude), i);
							    }
							}
						}else{
	
						}
					},
					error : function(request, status, error) {
						console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
						$toast.error('요청을 실패하였습니다.다시 시도 해주세요.');
					},
					complete : function(xhr, data) {
						$eventBus.emit('loadingOff');
					}
				});
			}
		},
		
		// 카테고리 검색을 요청하는 함수입니다
		fnSearchPlaces : function(idx) {
		    if ($rightTool.value.currCategory == "") {
		        return;
		    }
		    
		    if($mainFunction.value.level < $commonMap.value.mapLevel){
			    //음식점, 카페, 편의점이 아니면 리턴
			    if(idx == "7" || idx == "9" || idx == "10"){
				    for(let i=1; i<4; i++){
					    $rightTool.value.ps.categorySearch($rightTool.value.currCategory, $rightTool.ico.fnPlacesSearchCB, {
							useMapBounds:true,
							page:i
						});
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		
		// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
		fnPlacesSearchCB : function(data, status, pagination) {
		    if (status === kakao.maps.services.Status.OK) {
		        // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
		        $rightTool.ico.fnDisplayPlaces(data);
		    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
		        // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요
				console.log("검색결과 없음");
		    } else if (status === kakao.maps.services.Status.ERROR) {
		        // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
				console.log("검색결과 에러");
		        
		    }
		},
		
		// 지도에 마커를 표출하는 함수입니다
		fnDisplayPlaces : function(places) {
			let pageIdx = $rightTool.value.pageIdx * 15;
			
			$rightTool.value.pageIdx++;
			
		    for ( var i=0; i<places.length; i++ ) {
	            // 마커를 생성하고 지도에 표시합니다
	            $rightTool.ico.fnAddMarker(new kakao.maps.LatLng(places[i].y, places[i].x), i+pageIdx);
	            $rightTool.ico.fnDisplayPlaceInfo(places[i], i+pageIdx);
		    }
		},
		
		// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
		fnAddMarker : function(position, order) {
			let content = "";
			if($rightTool.value.searchIdx == 16 || $rightTool.value.searchIdx == 17 || $rightTool.value.searchIdx == 18){
				if($rightTool.value.rebuildList[order].imprvZoneNm.includes('조합') == 0){
					content += '<div class="basic-info-window highlight" style="margin-bottom: 20px" onclick="$rightTool.ico.fnOnRebuild(' + order + ')">';
					content += '<div class="basic-info-window__title">';
					content += '<img src="/assets/markers/06_3.svg" class="basic-info-window__title__img" alt="">';
					content += $rightTool.value.rebuildList[order].imprvZoneNm;
					content += '</div>';
					content += '</div>';
				} else {
					content += '<div class="basic-info-window highlight" style="margin-bottom: 20px" onclick="$rightTool.ico.fnOnRebuild(' + order + ')">';
					content += '<div class="basic-info-window__title">';
					content += '<i class="fas fa-map-marked basic-info-window__title__img"></i>';
					content += $rightTool.value.rebuildList[order].imprvZoneNm;
					content += '</div>';
					content += '</div>';
				}
			} else {
				let color = "";
				
				if($rightTool.value.searchIdx == 7 || $rightTool.value.searchIdx == 1 || $rightTool.value.searchIdx == 12){
					color = "blue";
				} else if($rightTool.value.searchIdx == 2 || $rightTool.value.searchIdx == 8 || $rightTool.value.searchIdx == 13){
					color = "red";
				} else if($rightTool.value.searchIdx == 3 || $rightTool.value.searchIdx == 9 || $rightTool.value.searchIdx == 14){
					color = "yellow";
				} else if($rightTool.value.searchIdx == 10 || $rightTool.value.searchIdx == 4 || $rightTool.value.searchIdx == 15){
					color = "skyblue";
				} else if($rightTool.value.searchIdx == 5 || $rightTool.value.searchIdx == 11){
					color = "pink";
				} else if($rightTool.value.searchIdx == 6){
					color = "green";
				} 
				
				content += '<div class="map-marker ' + color + '" onmouseover="$rightTool.ico.fnGetOpenWindow('+order+')" onmouseout="$rightTool.ico.fnGetHideWindow('+order+')">';
				content += '<img src="' + $rightTool.value.src + '" alt="">';
				content += '</div>';
			}
			
			var customOverlay = new kakao.maps.CustomOverlay({
			    map: map,
			    clickable: true,
			    content: content,
			    position: position,
			    xAnchor: 0.1, // 커스텀 오버레이의 가로 위치를 가운데로 조정
			    yAnchor: 0.1, // 커스텀 오버레이의 세로 위치를 아래쪽 끝으로 조정
			    zIndex: 3
			});
			
			customOverlay.setMap(map);
		    $rightTool.value.markers.push(customOverlay);  // 배열에 생성된 마커를 추가합니다
		},
		
		// 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수입니다
		fnDisplayPlaceInfo : function(place, i) {
			var content = "";
			var placeOverlay = new kakao.maps.CustomOverlay({zIndex:1}), 
	    		contentNode = document.createElement('div'); // 커스텀 오버레이의 컨텐츠 엘리먼트 입니다 	
			
			if($rightTool.value.searchIdx == 7 || $rightTool.value.searchIdx == 9 || $rightTool.value.searchIdx == 10){
				if(place.place_name.length < 9){
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 60px; right: 60px; display:none" name="customTemp" id="customTemp'+i+'">';
				} else {
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 60px; right: 90px; display:none" name="customTemp" id="customTemp'+i+'">';
				}
				content += '<div class="basic-info-window__title">';
				content += place.place_name;
				content += '</div>';
				content += '</div>';
				
			    contentNode.innerHTML = content;
				placeOverlay.setContent(contentNode);  
			    placeOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));
			} else if($rightTool.value.searchIdx == 8 || $rightTool.value.searchIdx == 11){
				if(place.name.length < 5){
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 60px; right: 40px; display:none" name="customTemp" id="customTemp'+i+'">';
				} else if(place.name.length < 10){
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 60px; right: 60px; display:none" name="customTemp" id="customTemp'+i+'">';
				} else {
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 60px; right: 90px; display:none" name="customTemp" id="customTemp'+i+'">';
				}
				content += '<div class="basic-info-window__title">';
				content += place.name;
				content += '</div>';
				content += '</div>';
				
			    contentNode.innerHTML = content;
				placeOverlay.setContent(contentNode);  
			    placeOverlay.setPosition(new kakao.maps.LatLng(place.latitude, place.longitude));
			} else if($rightTool.value.searchIdx == 13 || $rightTool.value.searchIdx == 14 || $rightTool.value.searchIdx == 15){
				if(place.name.length < 5){
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 100px; right: 60px; display:none" name="customTemp" id="customTemp'+i+'">';
				} else if(place.name.length < 10){
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 100px; right: 80px; display:none" name="customTemp" id="customTemp'+i+'">';
				} else {
					content = '<div class="basic-info-window" style="margin-bottom: 20px; bottom: 100px; right: 110px; display:none" name="customTemp" id="customTemp'+i+'">';
				}
				content += '<div class="basic-info-window__title">';
				content += place.name;
				content += '<span class="basic-info-window__badge">' + place.fondScCode + '</span>';
				content += '</div>';
				content += '<div class="basic-info-window__content">';
				content += '<div class="basic-info-window__row">';
				content += '학급당 학생수 <strong>' + place.countEachStudents + '</strong>명';
				content += '</div>';
				content += '</div>';
				content += '</div>';
				
			    contentNode.innerHTML = content;
				placeOverlay.setContent(contentNode);  
			    placeOverlay.setPosition(new kakao.maps.LatLng(place.latitude, place.longitude));
			}
			
		    placeOverlay.setMap(map);
		    
		    $rightTool.value.placeOverlays.push(placeOverlay);
		},
		
		// 클릭한 인포윈도우 보여주기
		fnGetOpenWindow : function(idx){
			$("#customTemp" + idx).show();
		},
		
		// 클릭한 인포윈도우 보여주기
		fnGetHideWindow : function(idx){
			$("#customTemp" + idx).hide();
		},
		
		/**
		 * 재개발 재건축 프로세스 보여주기
		 */
		fnOnRebuild : function(i){
			$commonMap.fnLayoutInit();
			$(".favorable-wrap").addClass("show");
			
			let level = Number($rightTool.value.rebuildList[i].nowProplsnMatrStep);
			
			$("#favo-body1-1").text($rightTool.value.rebuildList[i].bizTypeNm + " 상세정보");
			$("#favo-body1-2").html('<i class="fas fa-map-marked"></i>' + $rightTool.value.rebuildList[i].imprvZoneNm);
			$("#favo-body1-3").text($rightTool.value.rebuildList[i].nowProplsnMatrDesc);
			$("#favo-body1-4").text($rightTool.value.rebuildList[i].bizTypeNm + " 규모");
			$("#favo-body1-5").text(($rightTool.value.rebuildList[i].bizImplmtnHshldCntTotsum !== undefined) ? $rightTool.value.rebuildList[i].bizImplmtnHshldCntTotsum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "세대" : "-");
			$("#favo-body1-6").html('<div class="notice-item__subtitle">' + $rightTool.value.rebuildList[i].nowProplsnMatrDesc + ' 착수 후</div><div class="notice-item__title">0년 0개월 경과하였습니다.</div>');
			$("#favo-body1-7").html('<div class="notice-item__subtitle">' + $rightTool.value.rebuildList[i].nowProplsnMatrDesc + ' 착수 후</div><div class="notice-item__title">완료 추정일이 초과되었습니다</div>');
			
			for(let i=0; i<11; i++){
				$("#favo-body1-8-" + i).removeClass('completed');
				$("#favo-body1-8-" + i).removeClass('ongoing');
				$("#favo-body1-9-" + i).hide();
				$("#favo-body1-10-" + i).hide();
				
				if(i<level){
					$("#favo-body1-8-" + i).addClass('completed');
					$("#favo-body1-10-" + i).show();
				} else if(i == level){
					$("#favo-body1-8-" + i).addClass('ongoing');
					$("#favo-body1-9-" + i).show();
					$("#favo-body1-9-" + i).text("- 0년 0개월째 진행중(평균 소요시간 2년 3개월)");
				}
			}
		}
	},
	
	mapType : {
        /**
         * 일반 지도  -  해결 x
         */
         fnRoadMap: function(thiz) {
			if($(thiz).hasClass("active") == true){
				return false;
			}
			
			$("#mapType div").removeClass("active");
			$(thiz).addClass("active");
			
            map.removeOverlayMapTypeId($rightTool.value.mapType);

            $rightTool.value.mapType = kakao.maps.MapTypeId.ROADMAP;

            // maptype에 해당하는 지도타입을 지도에 추가합니다
            map.addOverlayMapTypeId($rightTool.value.mapType);
         },

        /**
         * 위성
         */
         fnSkyView : function(thiz){
			 if($(thiz).hasClass("active") == true){
				return false;
			}
			
			$("#mapType div").removeClass("active");
			$(thiz).addClass("active");
			
            map.removeOverlayMapTypeId($rightTool.value.mapType);

            $rightTool.value.mapType = kakao.maps.MapTypeId.SKYVIEW;

            // maptype에 해당하는 지도타입을 지도에 추가합니다
            map.addOverlayMapTypeId($rightTool.value.mapType);
         },

        /**
         * 지적도
         */
         fnIntellectual : function(thiz){
			 if($(thiz).hasClass("active") == true){
				return false;
			}
			
			$("#mapType div").removeClass("active");
			$(thiz).addClass("active");
			
            map.removeOverlayMapTypeId($rightTool.value.mapType);

            $rightTool.value.mapType = kakao.maps.MapTypeId.USE_DISTRICT;

            // maptype에 해당하는 지도타입을 지도에 추가합니다
            map.addOverlayMapTypeId($rightTool.value.mapType);
         },

        /**
         * 로드뷰
         */
         fnRoadView : function(thiz){
			 if($(thiz).hasClass("active") == true){
				return false;
			}
			
			$("#mapType div").removeClass("active");
			$(thiz).addClass("active");
			
            map.removeOverlayMapTypeId($rightTool.value.mapType);

            $rightTool.value.mapType = kakao.maps.MapTypeId.ROADVIEW;

            // maptype에 해당하는 지도타입을 지도에 추가합니다
            map.addOverlayMapTypeId($rightTool.value.mapType);
         }
    },

	
	distance : {
		// 지도에 클릭 이벤트를 등록합니다
		// 지도를 클릭하면 선 그리기가 시작됩니다 그려진 선이 있으면 지우고 다시 그립니다
		fnMClickEvent : function(mouseEvent) {
			
		    // 마우스로 클릭한 위치입니다 
		    var clickPosition = mouseEvent.latLng;
		
		    // 지도 클릭이벤트가 발생했는데 선을 그리고있는 상태가 아니면
		    if (!$rightTool.value.distance.drawingFlag) {
		
		        // 상태를 true로, 선이 그리고있는 상태로 변경합니다
		        $rightTool.value.distance.drawingFlag = true;
		        
		        // 지도 위에 선이 표시되고 있다면 지도에서 제거합니다
		        $rightTool.distance.deleteClickLine();
		        
		        // 지도 위에 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
		        $rightTool.distance.deleteDistnce();
		
		        // 지도 위에 선을 그리기 위해 클릭한 지점과 해당 지점의 거리정보가 표시되고 있다면 지도에서 제거합니다
		        $rightTool.distance.deleteCircleDot();
		    
		        // 클릭한 위치를 기준으로 선을 생성하고 지도위에 표시합니다
		        $rightTool.value.distance.clickLine = new kakao.maps.Polyline({
		            map: map, // 선을 표시할 지도입니다 
		            path: [clickPosition], // 선을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다
		            strokeWeight: 3, // 선의 두께입니다 
		            strokeColor: '#db4040', // 선의 색깔입니다
		            strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
		            strokeStyle: 'solid' // 선의 스타일입니다
		        });
		        
		        // 선이 그려지고 있을 때 마우스 움직임에 따라 선이 그려질 위치를 표시할 선을 생성합니다
		        $rightTool.value.distance.moveLine = new kakao.maps.Polyline({
		            strokeWeight: 3, // 선의 두께입니다 
		            strokeColor: '#db4040', // 선의 색깔입니다
		            strokeOpacity: 0.5, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
		            strokeStyle: 'solid' // 선의 스타일입니다    
		        });
		    
		        // 클릭한 지점에 대한 정보를 지도에 표시합니다
		        $rightTool.distance.displayCircleDot(clickPosition, 0);
		
		            
		    } else { // 선이 그려지고 있는 상태이면
		
		        // 그려지고 있는 선의 좌표 배열을 얻어옵니다
		        var path = $rightTool.value.distance.clickLine.getPath();
		
		        // 좌표 배열에 클릭한 위치를 추가합니다
		        path.push(clickPosition);
		        
		        // 다시 선에 좌표 배열을 설정하여 클릭 위치까지 선을 그리도록 설정합니다
		        $rightTool.value.distance.clickLine.setPath(path);
		
		        var distance = Math.round($rightTool.value.distance.clickLine.getLength());
		        $rightTool.distance.displayCircleDot(clickPosition, distance);
		    }
		},
		
		// 지도에 마우스무브 이벤트를 등록합니다
		// 선을 그리고있는 상태에서 마우스무브 이벤트가 발생하면 그려질 선의 위치를 동적으로 보여주도록 합니다
		fnMMoveEvent : function (mouseEvent) {
			
		    // 지도 마우스무브 이벤트가 발생했는데 선을 그리고있는 상태이면
		    if ($rightTool.value.distance.drawingFlag){
		        
		        // 마우스 커서의 현재 위치를 얻어옵니다 
		        var mousePosition = mouseEvent.latLng; 
		
		        // 마우스 클릭으로 그려진 선의 좌표 배열을 얻어옵니다
		        var path = $rightTool.value.distance.clickLine.getPath();
		        
		        // 마우스 클릭으로 그려진 마지막 좌표와 마우스 커서 위치의 좌표로 선을 표시합니다
		        var movepath = [path[path.length-1], mousePosition];
		        $rightTool.value.distance.moveLine.setPath(movepath);    
		        $rightTool.value.distance.moveLine.setMap(map);
		        
		        var distance = Math.round($rightTool.value.distance.clickLine.getLength() + $rightTool.value.distance.moveLine.getLength()), // 선의 총 거리를 계산합니다
		            content = '<div class="dotOverlay distanceInfo">총거리 <span class="number">' + distance + '</span>m</div>'; // 커스텀오버레이에 추가될 내용입니다
		        
		        // 거리정보를 지도에 표시합니다
		        $rightTool.distance.showDistance(content, mousePosition);   
		    }             
		},
		
		// 지도에 마우스 오른쪽 클릭 이벤트를 등록합니다
		// 선을 그리고있는 상태에서 마우스 오른쪽 클릭 이벤트가 발생하면 선 그리기를 종료합니다
		fnMRightClickEvent : function (mouseEvent) {
			// 지도 오른쪽 클릭 이벤트가 발생했는데 선을 그리고있는 상태이면
		    if ($rightTool.value.distance.drawingFlag) {
		        
		        // 마우스무브로 그려진 선은 지도에서 제거합니다
		        $rightTool.value.distance.moveLine.setMap(null);
		        $rightTool.value.distance.moveLine = null;  
		        
		        // 마우스 클릭으로 그린 선의 좌표 배열을 얻어옵니다
		        var path = $rightTool.value.distance.clickLine.getPath();
		    
		        // 선을 구성하는 좌표의 개수가 2개 이상이면
		        if (path.length > 1) {
		            // 마지막 클릭 지점에 대한 거리 정보 커스텀 오버레이를 지웁니다
		            if ($rightTool.value.distance.dots[$rightTool.value.distance.dots.length-1].distance) {
		                $rightTool.value.distance.dots[$rightTool.value.distance.dots.length-1].distance.setMap(null);
		                $rightTool.value.distance.dots[$rightTool.value.distance.dots.length-1].distance = null;    
		            }
		
		            var distance = Math.round($rightTool.value.distance.clickLine.getLength()), // 선의 총 거리를 계산합니다
		                content = $rightTool.distance.getTimeHTML(distance); // 커스텀오버레이에 추가될 내용입니다
		                
		            // 그려진 선의 거리정보를 지도에 표시합니다
		            $rightTool.distance.showDistance(content, path[path.length-1]);  
		             
		        } else {
		            // 선을 구성하는 좌표의 개수가 1개 이하이면 
		            // 지도에 표시되고 있는 선과 정보들을 지도에서 제거합니다.
		            $rightTool.distance.deleteClickLine();
		            $rightTool.distance.deleteCircleDot(); 
		            $rightTool.distance.deleteDistnce();
		        }
		        
		        // 상태를 false로, 그리지 않고 있는 상태로 변경합니다
		        $rightTool.value.distance.drawingFlag = false;          
		    }  
		},
		
		//거리재기 클릭 이벤트
		fnClickDistance : function() {
			$commonMap.fnRemoveAllListener();
			
			if($("#distanceTool").hasClass("active")){	// 취소시
				kakao.maps.event.addListener(map, 'click', $realtySearch.fnMainClickEvtClick);
			} else {	// 등록시
				kakao.maps.event.addListener(map, 'click', $rightTool.distance.fnMClickEvent);
				kakao.maps.event.addListener(map, 'mousemove', $rightTool.distance.fnMMoveEvent);                 
				kakao.maps.event.addListener(map, 'rightclick', $rightTool.distance.fnMRightClickEvent);    
			}
		},
		
		// 거리재기 클릭 초기화
		fnDistanceInit : function() {
	        
	        // 지도 위에 선이 표시되고 있다면 지도에서 제거합니다
	        $rightTool.distance.deleteClickLine();
	        
	        // 지도 위에 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
	        $rightTool.distance.deleteDistnce();
	
	        // 지도 위에 선을 그리기 위해 클릭한 지점과 해당 지점의 거리정보가 표시되고 있다면 지도에서 제거합니다
	        $rightTool.distance.deleteCircleDot();
	        
	        if ($rightTool.value.distance.drawingFlag){
				$rightTool.value.distance.moveLine.setMap(null);
		        $rightTool.value.distance.moveLine = null;  
			}

	        $rightTool.value.distance.drawingFlag = false;   
	        
			kakao.maps.event.removeListener(map, 'click', $rightTool.distance.fnMClickEvent);
			kakao.maps.event.removeListener(map, 'mousemove', $rightTool.distance.fnMMoveEvent);                 
			kakao.maps.event.removeListener(map, 'rightclick', $rightTool.distance.fnMRightClickEvent); 
		},
		
		// 클릭으로 그려진 선을 지도에서 제거하는 함수입니다
		deleteClickLine : function() {
		    if ($rightTool.value.distance.clickLine) {
		        $rightTool.value.distance.clickLine.setMap(null);    
		        $rightTool.value.distance.clickLine = null;        
		    }
		},
		
		// 마우스 드래그로 그려지고 있는 선의 총거리 정보를 표시하거
		// 마우스 오른쪽 클릭으로 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 생성하고 지도에 표시하는 함수입니다
		showDistance : function(content, position) {
		    
		    if ($rightTool.value.distance.distanceOverlay) { // 커스텀오버레이가 생성된 상태이면
		        
		        // 커스텀 오버레이의 위치와 표시할 내용을 설정합니다
		        $rightTool.value.distance.distanceOverlay.setPosition(position);
		        $rightTool.value.distance.distanceOverlay.setContent(content);
		        
		    } else { // 커스텀 오버레이가 생성되지 않은 상태이면
		        
		        // 커스텀 오버레이를 생성하고 지도에 표시합니다
		        $rightTool.value.distance.distanceOverlay = new kakao.maps.CustomOverlay({
		            map: map, // 커스텀오버레이를 표시할 지도입니다
		            content: content,  // 커스텀오버레이에 표시할 내용입니다
		            position: position, // 커스텀오버레이를 표시할 위치입니다.
		            xAnchor: 0,
		            yAnchor: 0,
		            zIndex: 3  
		        });      
		    }
		},
		
		// 그려지고 있는 선의 총거리 정보와 
		// 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 삭제하는 함수입니다
		deleteDistnce : function() {
		    if ($rightTool.value.distance.distanceOverlay) {
		        $rightTool.value.distance.distanceOverlay.setMap(null);
		        $rightTool.value.distance.distanceOverlay = null;
		    }
		},
		
		// 선이 그려지고 있는 상태일 때 지도를 클릭하면 호출하여 
		// 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 표출하는 함수입니다
		displayCircleDot : function(position, distance) {
		
		    // 클릭 지점을 표시할 빨간 동그라미 커스텀오버레이를 생성합니다
		    var circleOverlay = new kakao.maps.CustomOverlay({
		        content: '<span class="dot"></span>',
		        position: position,
		        zIndex: 1
		    });
		
		    // 지도에 표시합니다
		    circleOverlay.setMap(map);
		
		    if (distance > 0) {
		        // 클릭한 지점까지의 그려진 선의 총 거리를 표시할 커스텀 오버레이를 생성합니다
		        var distanceOverlay = new kakao.maps.CustomOverlay({
		            content: '<div class="dotOverlay">거리 <span class="number">' + distance + '</span>m</div>',
		            position: position,
		            yAnchor: 1,
		            zIndex: 2
		        });
		
		        // 지도에 표시합니다
		        distanceOverlay.setMap(map);
		    }
		
		    // 배열에 추가합니다
		    $rightTool.value.distance.dots.push({circle:circleOverlay, distance: distanceOverlay});
		},
		
		// 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 지도에서 모두 제거하는 함수입니다
		deleteCircleDot : function() {
		    var i;
		
		    for ( i = 0; i < $rightTool.value.distance.dots.length; i++ ){
		        if ($rightTool.value.distance.dots[i].circle) { 
		            $rightTool.value.distance.dots[i].circle.setMap(null);
		        }
		
		        if ($rightTool.value.distance.dots[i].distance) {
		            $rightTool.value.distance.dots[i].distance.setMap(null);
		        }
		    }
		
		    $rightTool.value.distance.dots = [];
		},
		
		// 마우스 우클릭 하여 선 그리기가 종료됐을 때 호출하여 
		// 그려진 선의 총거리 정보와 거리에 대한 도보, 자전거 시간을 계산하여
		// HTML Content를 만들어 리턴하는 함수입니다
		getTimeHTML : function(distance) {
		
		    // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
		    var walkkTime = distance / 67 | 0;
		    var walkHour = '', walkMin = '';
		
		    // 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
		    if (walkkTime > 60) {
		        walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + '</span>시간 '
		    }
		    walkMin = '<span class="number">' + walkkTime % 60 + '</span>분'
		
		    // 자전거의 평균 시속은 16km/h 이고 이것을 기준으로 자전거의 분속은 267m/min입니다
		    var bycicleTime = distance / 227 | 0;
		    var bycicleHour = '', bycicleMin = '';
		
		    // 계산한 자전거 시간이 60분 보다 크면 시간으로 표출합니다
		    if (bycicleTime > 60) {
		        bycicleHour = '<span class="number">' + Math.floor(bycicleTime / 60) + '</span>시간 '
		    }
		    bycicleMin = '<span class="number">' + bycicleTime % 60 + '</span>분'
		
		    // 거리와 도보 시간, 자전거 시간을 가지고 HTML Content를 만들어 리턴합니다
		    var content = '<ul class="dotOverlay distanceInfo">';
		    content += '    <li>';
		    content += '        <span class="label">총거리</span><span class="number">' + distance + '</span>m';
		    content += '    </li>';
		    content += '    <li>';
		    content += '        <span class="label">도보</span>' + walkHour + walkMin;
		    content += '    </li>';
		    content += '    <li>';
		    content += '        <span class="label">자전거</span>' + bycicleHour + bycicleMin;
		    content += '    </li>';
		    content += '</ul>'
		
		    return content;
		}
	},
	
	square : {
		// 지도에 마우스 클릭 이벤트를 등록합니다
		// 지도를 클릭하면 다각형 그리기가 시작됩니다 그려진 다각형이 있으면 지우고 다시 그립니다
		fnMClickEvent : function(mouseEvent) {
			
		    // 마우스로 클릭한 위치입니다 
		    var clickPosition = mouseEvent.latLng; 
		    
		    // 지도 클릭이벤트가 발생했는데 다각형이 그려지고 있는 상태가 아니면
		    if (!$rightTool.value.square.drawingFlag) {
		
		        // 상태를 true로, 다각형을 그리고 있는 상태로 변경합니다
		        $rightTool.value.square.drawingFlag = true;
		        
		        // 지도 위에 다각형이 표시되고 있다면 지도에서 제거합니다
		        if ($rightTool.value.square.polygon) {  
		            $rightTool.value.square.polygon.setMap(null);      
		            $rightTool.value.square.polygon = null;  
		        }
		        
		        // 지도 위에 면적정보 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
		        if ($rightTool.value.square.areaOverlay) {
		            $rightTool.value.square.areaOverlay.setMap(null);
		            $rightTool.value.square.areaOverlay = null;
		        }
		    
		        // 그려지고 있는 다각형을 표시할 다각형을 생성하고 지도에 표시합니다
		        $rightTool.value.square.drawingPolygon = new kakao.maps.Polygon({
		            map: map, // 다각형을 표시할 지도입니다
		            path: [clickPosition], // 다각형을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다
		            strokeWeight: 3, // 선의 두께입니다 
		            strokeColor: '#00a0e9', // 선의 색깔입니다
		            strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
		            strokeStyle: 'solid', // 선의 스타일입니다
		            fillColor: '#00a0e9', // 채우기 색깔입니다
		            fillOpacity: 0.2 // 채우기 불투명도입니다
		        }); 
		        
		        // 그리기가 종료됐을때 지도에 표시할 다각형을 생성합니다 
		        $rightTool.value.square.polygon = new kakao.maps.Polygon({ 
		            path: [clickPosition], // 다각형을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다 
		            strokeWeight: 3, // 선의 두께입니다 
		            strokeColor: '#00a0e9', // 선의 색깔입니다   
		            strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
		            strokeStyle: 'solid', // 선의 스타일입니다
		            fillColor: '#00a0e9', // 채우기 색깔입니다
		            fillOpacity: 0.2 // 채우기 불투명도입니다
		        });
		
		        
		    } else { // 다각형이 그려지고 있는 상태이면 
		        
		        // 그려지고 있는 다각형의 좌표에 클릭위치를 추가합니다
		        // 다각형의 좌표 배열을 얻어옵니다
		        var drawingPath = $rightTool.value.square.drawingPolygon.getPath();
		    
		        // 좌표 배열에 클릭한 위치를 추가하고
		        drawingPath.push(clickPosition);
		        
		        // 다시 다각형 좌표 배열을 설정합니다
		        $rightTool.value.square.drawingPolygon.setPath(drawingPath);
		         
		    
		        // 그리기가 종료됐을때 지도에 표시할 다각형의 좌표에 클릭 위치를 추가합니다
		        // 다각형의 좌표 배열을 얻어옵니다
		        var path = $rightTool.value.square.polygon.getPath();
		    
		        // 좌표 배열에 클릭한 위치를 추가하고
		        path.push(clickPosition);
		        
		        // 다시 다각형 좌표 배열을 설정합니다
		        $rightTool.value.square.polygon.setPath(path);
		    }
		
		},
		
		// 지도에 마우스무브 이벤트를 등록합니다
		// 다각형을 그리고있는 상태에서 마우스무브 이벤트가 발생하면 그려질 다각형의 위치를 동적으로 보여주도록 합니다
		fnMMoveEvent : function (mouseEvent) {
			
		    // 지도 마우스무브 이벤트가 발생했는데 다각형을 그리고있는 상태이면
		    if ($rightTool.value.square.drawingFlag){
		
		        // 마우스 커서의 현재 위치를 얻어옵니다 
		        var mousePosition = mouseEvent.latLng; 
		        
		        // 그려지고있는 다각형의 좌표배열을 얻어옵니다
		        var path = $rightTool.value.square.drawingPolygon.getPath();
		        
		        // 마우스무브로 추가된 마지막 좌표를 제거합니다
		        if (path.length > 1) {
		            path.pop();
		        } 
		        
		        // 마우스의 커서 위치를 좌표 배열에 추가합니다
		        path.push(mousePosition);
		
		        // 그려지고 있는 다각형의 좌표를 다시 설정합니다
		        $rightTool.value.square.drawingPolygon.setPath(path);
		    }             
		},
		
		// 지도에 마우스 오른쪽 클릭 이벤트를 등록합니다
		// 다각형을 그리고있는 상태에서 마우스 오른쪽 클릭 이벤트가 발생하면 그리기를 종료합니다
		fnMRightClickEvent : function (mouseEvent) {
			
		    // 지도 오른쪽 클릭 이벤트가 발생했는데 다각형을 그리고있는 상태이면
		    if ($rightTool.value.square.drawingFlag) {
		        
		        // 그려지고있는 다각형을  지도에서 제거합니다
		        $rightTool.value.square.drawingPolygon.setMap(null);
		        $rightTool.value.square.drawingPolygon = null;  
		        
		        // 클릭된 죄표로 그릴 다각형의 좌표배열을 얻어옵니다
		        var path = $rightTool.value.square.polygon.getPath();
		    
		        // 다각형을 구성하는 좌표의 개수가 3개 이상이면 
		        if (path.length > 2) {
		            
		            // 지도에 다각형을 표시합니다
		            $rightTool.value.square.polygon.setMap(map);

		            var area = Math.round($rightTool.value.square.polygon.getArea()), // 다각형의 총면적을 계산합니다
		                content = '<div class="info">총면적 <span class="number"> ' + area + '</span> m<sup>2</sup></div>'; // 커스텀오버레이에 추가될 내용입니다
		                
		            // 면적정보를 지도에 표시합니다
		            $rightTool.value.square.areaOverlay = new kakao.maps.CustomOverlay({
		                map: map, // 커스텀오버레이를 표시할 지도입니다 
		                content: content,  // 커스텀오버레이에 표시할 내용입니다
		                xAnchor: 0,
		                yAnchor: 0,
		                position: path[path.length-1]  // 커스텀오버레이를 표시할 위치입니다. 위치는 다각형의 마지막 좌표로 설정합니다
		            });      
		
		             
		        } else { 
		            
		            // 다각형을 구성하는 좌표가 2개 이하이면 다각형을 지도에 표시하지 않습니다 
		            $rightTool.value.square.polygon = null;  
		        }
		        
		        // 상태를 false로, 그리지 않고 있는 상태로 변경합니다
		        $rightTool.value.square.drawingFlag = false;          
		    }  
		},
		
		//면적재기 클릭 이벤트
		fnClickSquare : function() {
			$commonMap.fnRemoveAllListener();
			
			if($("#squareTool").hasClass("active")){	// 취소시
				kakao.maps.event.addListener(map, 'click', $realtySearch.fnMainClickEvtClick);
			} else {	// 등록시
				kakao.maps.event.addListener(map, 'click', $rightTool.square.fnMClickEvent);
				kakao.maps.event.addListener(map, 'mousemove', $rightTool.square.fnMMoveEvent);     
				kakao.maps.event.addListener(map, 'rightclick', $rightTool.square.fnMRightClickEvent);    
			}
		},
		
		// 다각형 클릭 초기화
		fnSquareInit : function() {
	        // 지도 위에 다각형이 표시되고 있다면 지도에서 제거합니다
	        if ($rightTool.value.square.polygon) {  
	            $rightTool.value.square.polygon.setMap(null);      
	            $rightTool.value.square.polygon = null;  
	        }
	        if ($rightTool.value.square.areaOverlay) {
	            $rightTool.value.square.areaOverlay.setMap(null);
	            $rightTool.value.square.areaOverlay = null;
	        }
	        if ($rightTool.value.square.drawingFlag) {
		        $rightTool.value.square.drawingPolygon.setMap(null);
			}
	        
	        $rightTool.value.square.drawingFlag = false;   

			kakao.maps.event.removeListener(map, 'click', $rightTool.square.fnMClickEvent);
			kakao.maps.event.removeListener(map, 'mousemove', $rightTool.square.fnMMoveEvent);     
			kakao.maps.event.removeListener(map, 'rightclick', $rightTool.square.fnMRightClickEvent);   
		}
	},
};

$(function(){
    $rightTool.init();
});