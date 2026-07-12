// ============================================
// 1. 血しぶき（ボディヒット用）
// ============================================
function createBloodEffect(scene, position, hitDirection, count = 40) {
    try {
        const ps = new BABYLON.ParticleSystem("bloodParticles", count, scene);
        ps.particleTexture = new BABYLON.Texture(
            "https://playground.babylonjs.com/textures/flare.png",
            scene
        );
        ps.color1 = new BABYLON.Color4(1, 0.2, 0.1, 1);
        ps.color2 = new BABYLON.Color4(0.6, 0, 0, 0.8);
        ps.colorDead = new BABYLON.Color4(0.3, 0, 0, 0);
        ps.minSize = 0.08;
        ps.maxSize = 0.25;
        ps.emitter = position;
        const dir = hitDirection.normalize();
        ps.direction1 = new BABYLON.Vector3(-1, -0.5, -1);
        ps.direction2 = new BABYLON.Vector3(1, 2, 1);
        ps.gravity = new BABYLON.Vector3(0, -5, 0);
        ps.minEmitPower = 1;
        ps.maxEmitPower = 3;
        ps.minLifeTime = 0.5;
        ps.maxLifeTime = 1.0;
        ps.targetStopDuration = 0.3;
        ps.disposeOnStop = false;
        ps.emitRate = count / 0.3;
        ps.start();
        setTimeout(() => { if (!ps.isDisposed) ps.dispose(); }, 1500);
    } catch (e) { console.error("Blood effect error:", e); }
}

// ============================================
// 2. ヘッドショット用エフェクト（白い星型）
// ============================================
function createHeadshotEffect(scene, position) {
    try {
        const count = 80;
        const ps = new BABYLON.ParticleSystem("headshotParticles", count, scene);
        ps.particleTexture = new BABYLON.Texture(
            "https://playground.babylonjs.com/textures/flare.png",
            scene
        );
        ps.color1 = new BABYLON.Color4(1, 1, 1, 1);
        ps.color2 = new BABYLON.Color4(1, 0.9, 0.5, 0.7);
        ps.colorDead = new BABYLON.Color4(1, 0.5, 0, 0);
        ps.minSize = 0.2;
        ps.maxSize = 0.6;
        ps.emitter = position;
        ps.direction1 = new BABYLON.Vector3(-2.5, -2.5, -2.5);
        ps.direction2 = new BABYLON.Vector3(2.5, 2.5, 2.5);
        ps.gravity = new BABYLON.Vector3(0, 0, 0);
        ps.minEmitPower = 4;
        ps.maxEmitPower = 9;
        ps.minLifeTime = 0.25;
        ps.maxLifeTime = 0.5;
        ps.targetStopDuration = 0.05;
        ps.disposeOnStop = false;
        ps.emitRate = count / 0.05;
        ps.start();
        setTimeout(() => { if (!ps.isDisposed) ps.dispose(); }, 1000);
    } catch (e) { console.error("Headshot effect error:", e); }
}

// ============================================
// 3. 簡易リボルバー（フォールバック用）
// ============================================
function createSimpleRevolver(scene, camera) {
    const group = new BABYLON.Mesh("gunGroup", scene);
    group.parent = camera;
    group.position = new BABYLON.Vector3(0.4, -0.2, 0.6);
    group.rotation = new BABYLON.Vector3(-0.05, 0.05, 0);

    const barrel = BABYLON.MeshBuilder.CreateCylinder("barrel", { diameter: 0.06, height: 0.4 }, scene);
    barrel.parent = group;
    barrel.position.set(0, 0.02, 0.2);
    const bMat = new BABYLON.StandardMaterial("bMat", scene);
    bMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
    bMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    barrel.material = bMat;

    const grip = BABYLON.MeshBuilder.CreateBox("grip", { width: 0.1, height: 0.2, depth: 0.07 }, scene);
    grip.parent = group;
    grip.position.set(0, -0.15, -0.05);
    const gMat = new BABYLON.StandardMaterial("gMat", scene);
    gMat.diffuseColor = new BABYLON.Color3(0.15, 0.08, 0.04);
    grip.material = gMat;

    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", { diameter: 0.12, height: 0.08 }, scene);
    cylinder.parent = group;
    cylinder.position.set(0, 0.02, 0.15);
    const cMat = new BABYLON.StandardMaterial("cMat", scene);
    cMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.3);
    cMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    cylinder.material = cMat;

    return group;
}

// ============================================
// 4. メインシーン（エクスポートなし＝グローバル関数）
// ============================================
function createScene(engine) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    scene.gravity = new BABYLON.Vector3(0, -0.5, 0);

    // ---- カメラ ----
    const camera = new BABYLON.FreeCamera(
        "camera",
        new BABYLON.Vector3(0, 1.5, -10),
        scene
    );
    camera.attachControl(true);
    camera.setTarget(new BABYLON.Vector3(0, 1.5, 0));
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5);
    camera.speed = 0.3;
    camera.keysUp = [87];
    camera.keysDown = [83];
    camera.keysLeft = [65];
    camera.keysRight = [68];

    // ---- しゃがみ ----
    let isCrouching = false;
    const standHeight = 1.5, crouchHeight = 0.9;
    const standSpeed = 0.3, crouchSpeed = 0.12;
    const standEllipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5);
    const crouchEllipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);

    window.addEventListener("keydown", (e) => {
        if (e.code === "ControlLeft" || e.code === "ControlRight") {
            if (isCrouching) return;
            isCrouching = true;
            camera.speed = crouchSpeed;
            camera.ellipsoid.copyFrom(crouchEllipsoid);
            camera.position.y = crouchHeight;
        }
    });
    window.addEventListener("keyup", (e) => {
        if (e.code === "ControlLeft" || e.code === "ControlRight") {
            isCrouching = false;
            camera.speed = standSpeed;
            camera.ellipsoid.copyFrom(standEllipsoid);
            camera.position.y = standHeight;
        }
    });

    // ---- T字クロスヘア ----
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const vLine = new BABYLON.GUI.Rectangle();
    vLine.width = "2px";
    vLine.height = "16px";
    vLine.color = "lime";
    vLine.thickness = 0;
    vLine.background = "lime";
    vLine.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    vLine.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    ui.addControl(vLine);

    const hLine = new BABYLON.GUI.Rectangle();
    hLine.width = "16px";
    hLine.height = "2px";
    hLine.color = "lime";
    hLine.thickness = 0;
    hLine.background = "lime";
    hLine.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    hLine.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    hLine.top = "-8px";
    ui.addControl(hLine);

    // ---- 照明 ----
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // ---- 地面 ----
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const gMat = new BABYLON.StandardMaterial("gMat", scene);
    gMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
    ground.material = gMat;
    ground.checkCollisions = true;

    // ---- 敵配置 ----
    const enemies = [];
    const enemyPositions = [
        new BABYLON.Vector3(-3, 1.5, 8),
        new BABYLON.Vector3(3, 1.5, 10),
        new BABYLON.Vector3(0, 1.5, 14),
        new BABYLON.Vector3(-4, 1.5, 18),
        new BABYLON.Vector3(5, 1.5, 20),
    ];

    enemyPositions.forEach((pos) => {
        const enemy = BABYLON.MeshBuilder.CreateBox(
            "enemy",
            { width: 1.2, height: 2.5, depth: 0.5 },
            scene
        );
        enemy.position = pos.clone();
        enemy.checkCollisions = true;
        const mat = new BABYLON.StandardMaterial("enemyMat", scene);
        mat.diffuseColor = new BABYLON.Color3(1, 0.15, 0.15);
        enemy.material = mat;
        enemy.userData = {
            hp: 3,
            maxHp: 3,
            isDead: false,
            material: mat,
            startX: pos.x,
            speed: 0.3 + Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2
        };
        enemies.push(enemy);
    });

    // ---- 血デカール ----
    const bloodMat = new BABYLON.StandardMaterial("bloodMat", scene);
    bloodMat.diffuseColor = new BABYLON.Color3(0.6, 0, 0);
    bloodMat.alpha = 0.9;
    bloodMat.zOffset = -2;

    // ---- 弾薬システム ----
    let ammo = 6;
    const maxAmmo = 6;
    let isReloading = false;
    const reloadTime = 1500;
    let score = 0;

    // ---- GUI表示 ----
    const ammoText = new BABYLON.GUI.TextBlock();
    ammoText.text = `🔫 ${ammo}/${maxAmmo}`;
    ammoText.color = "white";
    ammoText.fontSize = 28;
    ammoText.fontFamily = "Arial";
    ammoText.fontWeight = "bold";
    ammoText.shadowColor = "black";
    ammoText.shadowOffsetX = 2;
    ammoText.shadowOffsetY = 2;
    ammoText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    ammoText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    ammoText.top = "-30px";
    ammoText.left = "-30px";
    ui.addControl(ammoText);

    const reloadText = new BABYLON.GUI.TextBlock();
    reloadText.text = "";
    reloadText.color = "yellow";
    reloadText.fontSize = 20;
    reloadText.fontFamily = "Arial";
    reloadText.fontWeight = "bold";
    reloadText.shadowColor = "black";
    reloadText.shadowOffsetX = 2;
    reloadText.shadowOffsetY = 2;
    reloadText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    reloadText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    reloadText.top = "-65px";
    reloadText.left = "-30px";
    ui.addControl(reloadText);

    const scoreText = new BABYLON.GUI.TextBlock();
    scoreText.text = `🎯 ${score}`;
    scoreText.color = "white";
    scoreText.fontSize = 28;
    scoreText.fontFamily = "Arial";
    scoreText.fontWeight = "bold";
    scoreText.shadowColor = "black";
    scoreText.shadowOffsetX = 2;
    scoreText.shadowOffsetY = 2;
    scoreText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    scoreText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scoreText.top = "20px";
    scoreText.left = "20px";
    ui.addControl(scoreText);

    // ---- UI更新 ----
    function updateUI() {
        ammoText.text = `🔫 ${ammo}/${maxAmmo}`;
        ammoText.color = (ammo === 0 && !isReloading) ? "red" : (isReloading ? "yellow" : "white");
        scoreText.text = `🎯 ${score}`;
        reloadText.text = isReloading ? "🔄 RELOADING..." : "";
    }

    // ---- リロード ----
    function startReload() {
        if (isReloading || ammo === maxAmmo) return;
        isReloading = true;
        updateUI();
        setTimeout(() => {
            ammo = maxAmmo;
            isReloading = false;
            updateUI();
        }, reloadTime);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); startReload(); }
    });

    // ---- GLB武器モデル読み込み ----
    let gunModel = null;
    let shootAnimation = null;
    let animationDuration = 0.25;
    let isFiring = false;

    BABYLON.SceneLoader.ImportMeshAsync("", "./", "revolver.glb", scene)
        .then((result) => {
            gunModel = result.meshes[0];
            if (!gunModel) {
                console.warn("⚠️ モデルが見つかりません。簡易リボルバーを使用します。");
                gunModel = createSimpleRevolver(scene, camera);
                return;
            }
            gunModel.parent = camera;
            gunModel.position = new BABYLON.Vector3(0, 0, 2);
            gunModel.rotation = new BABYLON.Vector3(-0.05, 0.05, 0);
            gunModel.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

            if (result.animationGroups && result.animationGroups.length > 0) {
                shootAnimation = result.animationGroups[0];
                const range = shootAnimation.getAnimationRange();
                if (range) {
                    animationDuration = range.to - range.from;
                } else {
                    animationDuration = shootAnimation.to || 0.25;
                }
                console.log(`🔫 アニメーション長: ${animationDuration}秒`);
            }
            console.log("✅ GLBモデル読み込み完了");
        })
        .catch((err) => {
            console.error("❌ GLB読み込みエラー:", err);
            gunModel = createSimpleRevolver(scene, camera);
        });

    // ---- リコイル＆拡散 ----
    let isMoving = false;
    let shotCount = 0;
    let recoilX = 0, recoilY = 0;
    const SPREAD_MIN = 0.003;
    const SPREAD_MAX = 0.12;
    const MOVE_SPREAD_PENALTY = 0.05;

    const keysPressed = {};
    window.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        const moveKeys = ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (moveKeys.includes(e.key)) isMoving = true;
    });
    window.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
        const moveKeys = ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (moveKeys.includes(e.key)) {
            if (!moveKeys.some(k => keysPressed[k])) isMoving = false;
        }
    });

    // ---- 弾丸管理 ----
    const bullets = [];

    // ---- 発射処理 ----
    scene.onPointerObservable.add((evt) => {
        if (evt.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            if (isFiring) { console.log("⏳ アニメーション中..."); return; }
            if (isReloading) { console.log("⏳ リロード中..."); return; }
            if (ammo <= 0) { console.log("🔴 弾切れ！"); startReload(); return; }

            // 弾丸作成
            const bullet = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: 0.2 }, scene);
            const bMat2 = new BABYLON.StandardMaterial("bMat2", scene);
            bMat2.diffuseColor = new BABYLON.Color3(1, 1, 1);
            bMat2.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            bullet.material = bMat2;

            // 拡散
            let direction = camera.getForwardRay().direction.clone();
            direction.normalize();
            let spread = SPREAD_MIN;
            if (isMoving) spread += MOVE_SPREAD_PENALTY;
            if (isCrouching) spread *= 0.5;
            spread += shotCount * 0.003;
            spread = Math.min(spread, SPREAD_MAX);

            direction.x += (Math.random() - 0.5) * spread;
            direction.y += (Math.random() - 0.5) * spread;
            direction.z += (Math.random() - 0.5) * spread * 0.5;
            direction.normalize();

            // リコイル（強め）
            const recoilAmountX = (Math.random() - 0.5) * 0.015 + shotCount * 0.001;
            const recoilAmountY = 0.035 + shotCount * 0.004;
            recoilX += recoilAmountX;
            recoilY += recoilAmountY;
            camera.rotation.x -= recoilAmountY;
            camera.rotation.z += recoilAmountX * 0.3;
            shotCount += 1.0;

            // 発射
            const spawnOffset = direction.scale(1);
            bullet.position = camera.position.clone().add(spawnOffset);
            bullet.direction = direction;
            bullet.speed = 3.0;
            bullet.prevPosition = bullet.position.clone();
            bullets.push(bullet);

            ammo--;
            updateUI();
            if (ammo === 0) startReload();

            // アニメーションロック
            if (shootAnimation) {
                isFiring = true;
                if (shootAnimation.isPlaying) shootAnimation.stop();
                shootAnimation.play(false);
                setTimeout(() => { isFiring = false; }, animationDuration * 1000);
            } else {
                isFiring = true;
                setTimeout(() => { isFiring = false; }, 150);
            }
        }
    });

    // ---- 毎フレーム ----
    scene.onBeforeRenderObservable.add(() => {
        // 拡散回復
        shotCount = Math.max(0, shotCount - scene.getEngine().getDeltaTime() * 0.008);
        // リコイル回復
        recoilX *= 0.85;
        recoilY *= 0.85;
        if (Math.abs(recoilX) < 0.0005) recoilX = 0;
        if (Math.abs(recoilY) < 0.0005) recoilY = 0;

        // 現在の拡散
        let spread = SPREAD_MIN;
        if (isMoving) spread += MOVE_SPREAD_PENALTY;
        if (isCrouching) spread *= 0.5;
        spread += shotCount * 0.003;
        spread = Math.min(spread, SPREAD_MAX);

        // クロスヘア
        const crossSize = 8 + spread * 200;
        vLine.height = crossSize + "px";
        hLine.width = crossSize + "px";
        hLine.top = (-crossSize / 2) + "px";
        hLine.left = (-crossSize / 2) + "px";

        if (isFiring) {
            vLine.color = "red";
            hLine.color = "red";
        } else if (isMoving) {
            vLine.color = "orange";
            hLine.color = "orange";
        } else {
            vLine.color = "lime";
            hLine.color = "lime";
        }

        // 敵移動
        const time = Date.now() / 1000;
        enemies.forEach(enemy => {
            if (enemy.userData.isDead) return;
            enemy.position.x = enemy.userData.startX + Math.sin(time * enemy.userData.speed + enemy.userData.phase) * 2.5;
        });

        // 弾丸処理
        try {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                if (!bullet || bullet.isDisposed()) continue;

                bullet.prevPosition = bullet.position.clone();
                bullet.position.addInPlace(bullet.direction.scale(bullet.speed));

                const ray = new BABYLON.Ray(bullet.prevPosition, bullet.direction, bullet.speed);
                const hit = scene.pickWithRay(ray, (mesh) => mesh === ground || enemies.includes(mesh));

                if (hit && hit.hit && hit.pickedPoint) {
                    const hitEnemy = hit.pickedMesh;
                    if (enemies.includes(hitEnemy) && !hitEnemy.userData.isDead) {
                        const isHeadshot = hit.pickedPoint.y > hitEnemy.position.y + 0.5;
                        const damage = isHeadshot ? 3 : 1;

                        hitEnemy.userData.hp -= damage;
                        const mat = hitEnemy.userData.material;

                        if (hitEnemy.userData.hp <= 0) {
                            hitEnemy.userData.isDead = true;
                            score++;
                            updateUI();
                            console.log(`💀 撃破！ スコア: ${score}`);

                            if (isHeadshot) {
                                createHeadshotEffect(scene, hit.pickedPoint.clone());
                            } else {
                                createBloodEffect(scene, hit.pickedPoint.clone(), bullet.direction);
                            }

                            const decal = BABYLON.MeshBuilder.CreateDecal(
                                "blood", hitEnemy,
                                {
                                    position: hit.pickedPoint,
                                    normal: hit.getNormal(true) || bullet.direction.negate(),
                                    size: new BABYLON.Vector3(0.8, 0.8, 0.8)
                                }
                            );
                            decal.material = bloodMat;

                            hitEnemy.dispose();
                            const idx = enemies.indexOf(hitEnemy);
                            if (idx > -1) enemies.splice(idx, 1);
                        } else {
                            const ratio = hitEnemy.userData.hp / hitEnemy.userData.maxHp;
                            mat.diffuseColor = new BABYLON.Color3(1, 0.15 * ratio, 0.15 * ratio);
                            if (isHeadshot) {
                                createHeadshotEffect(scene, hit.pickedPoint.clone());
                            } else {
                                createBloodEffect(scene, hit.pickedPoint.clone(), bullet.direction);
                            }
                        }

                        bullet.dispose();
                        bullets.splice(i, 1);
                        continue;
                    }

                    if (hit.pickedMesh === ground) {
                        bullet.dispose();
                        bullets.splice(i, 1);
                        continue;
                    }
                }

                if (BABYLON.Vector3.Distance(bullet.position, camera.position) > 100) {
                    bullet.dispose();
                    bullets.splice(i, 1);
                }
            }
        } catch (e) {
            console.error("Error:", e);
        }
    });

    // ---- ポインタロック ----
    const canvas = engine.getRenderingCanvas();
    canvas.addEventListener("click", () => {
        if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock();
        }
    });

    return scene;
}
